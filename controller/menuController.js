const { sequelize } = require("../models");
const db = require("../models");
const { uploadImage } = require("../services/imageUploadService");
const { registerMenu, createTopping } = require("../services/menuService");

const createMenu = async (req, res) => {
  const { name, price, toppings } = req.body; // Assume toppings is an array of topping names
  const restaurantId = req.user.restaurantId;

  const image = req.file;
  const transaction = await sequelize.transaction();

  if (!req.file || req.file.length === 0) {
    return res.status(400).json({ error: "No image files uploaded" });
  }

  try {
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image.path, "menu_images");
    }

    const existingMenu = await db.Menu.findOne({ where: { name: name } });
    if (existingMenu) {
      return res
        .status(400)
        .json({ error: "Menu with this Name already exists" });
    }

    const menu = { name, price, image: imageUrl, restaurantId };
    const newMenu = await registerMenu(menu, transaction);

    const toppingIds = [];
    for (const toppingName of toppings) {
      const topping = await createTopping(toppingName, transaction);
      toppingIds.push(topping.id);
    }


    await transaction.commit();

    res
      .status(201)
      .json({ message: "Menu created successfully", newMenu });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getToppings = async (req, res) => {
  try {
    const toppings = await db.Topping.findAll();
    res.status(200).json(toppings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createMenu, getToppings };
