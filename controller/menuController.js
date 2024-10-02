const { sequelize } = require("../models");
const db = require("../models");
const { Op } = require("sequelize");
const { uploadImage } = require("../services/imageUploadService");
const { registerMenu, createTopping } = require("../services/menuService");

const createMenu = async (req, res) => {
  const { name, price, toppings } = req.body;
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

    await newMenu.addToppings(toppingIds, { transaction });
    await transaction.commit();

    res.status(201).json({ message: "Menu created successfully", newMenu });
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

const getMenuById = async (req, res) => {
  const { id } = req.params;

  try {
    const menuItem = await db.Menu.findOne({
      where: { id },
      include: [
        {
          model: db.Restaurant,
          attributes: ["name"],
          as: "restaurant",
        },
        {
          model: db.Topping,
          attributes: ["name"],
        },
      ],
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json(menuItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllMenus = async (req, res) => {
  const { menuName, toppingName, restaurantName } = req.query;

  try {
    const whereConditions = {
      ...(menuName && {
        name: {
          [Op.iLike]: `%${menuName}%`,
        },
      }),
    };

    const menus = await db.Menu.findAll({
      where: whereConditions,
      include: [
        {
          model: db.Restaurant,
          attributes: ["name"],
          ...(restaurantName && {
            where: {
              name: {
                [Op.iLike]: `%${restaurantName}%`,
              },
            },
          }),
        },
        {
          model: db.Topping,
          attributes: ["name"],
          ...(toppingName && {
            where: {
              name: {
                [Op.iLike]: `%${toppingName}%`,
              },
            },
          }),
        },
      ],
      distinct: true,
    });

    return res.status(200).json(menus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPopularMenus = async (req, res) => {
  try {
    const query = `
    SELECT 
        "Menu".*,
        "Restaurant"."id" AS "Restaurant.id",
        "Restaurant"."name" AS "Restaurant.name",
        "Restaurant"."logo" AS "Restaurant.logo",
        "Topping"."name" AS "Topping.name"
      FROM (
        SELECT 
          "Menu"."id", 
          "Menu"."name", 
          "Menu"."price", 
          "Menu"."image", 
          "Menu"."restaurantId", 
          "Menu"."createdAt", 
          "Menu"."updatedAt", 
          COUNT("OrderItems"."id") AS "ordersCount"
        FROM "Menus" AS "Menu"
        LEFT OUTER JOIN "OrderItems" AS "OrderItems" 
          ON "Menu"."id" = "OrderItems"."menuId"
        GROUP BY "Menu"."id"
        ORDER BY COUNT("OrderItems"."id") DESC
        LIMIT 10
      ) AS "Menu"
      LEFT OUTER JOIN "Restaurants" AS "Restaurant" 
        ON "Menu"."restaurantId" = "Restaurant"."id"
      LEFT OUTER JOIN "MenuToppings" AS "MenuTopping" 
        ON "Menu"."id" = "MenuTopping"."menuId"
      LEFT OUTER JOIN "Toppings" AS "Topping" 
        ON "MenuTopping"."toppingId" = "Topping"."id"
      ORDER BY "Menu"."ordersCount" DESC;
    `;

    const [results] = await sequelize.query(query);
    const structuredResults = results.reduce((acc, item) => {
      const existingMenu = acc.find(menu => menu.id === item.id);

      // If the menu item doesn't exist in the accumulator, create it
      if (!existingMenu) {
        acc.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          ordersCount: item.ordersCount,
          restaurant: {
            id: item['Restaurant.id'],
            name: item['Restaurant.name'],
            logo: item['Restaurant.logo'],
          },
          toppings: item['Topping.name'] ? [item['Topping.name']] : [], // Initialize toppings
        });
      } else {
        // If the menu item already exists, add the topping
        if (item['Topping.name'] && !existingMenu.toppings.includes(item['Topping.name'])) {
          existingMenu.toppings.push(item['Topping.name']);
        }
      }
      return acc;
    }, []);

    console.log(structuredResults); // This will log the structured result

    return res.status(200).json(structuredResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getTopRestaurants = async (req, res) => {
  try {
    const query = `
   SELECT 
  "Restaurant".*, 
  COUNT("orderItems"."id") AS "ordersCount"
FROM 
  "Restaurants" AS "Restaurant"
LEFT OUTER JOIN "Menus" AS "pizza" ON "Restaurant"."id" = "pizza"."restaurantId"
LEFT OUTER JOIN "OrderItems" AS "orderItems" ON "pizza"."id" = "orderItems"."menuId"
GROUP BY 
  "Restaurant"."id"
ORDER BY 
  "ordersCount" DESC 
LIMIT 10;
    `;
    const [results] = await sequelize.query(query);
    const formattedRestaurants = results.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      location: restaurant.location,
      logo: restaurant.logo,
      ordersCount: restaurant.ordersCount,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    }));
    return res.status(200).json(formattedRestaurants);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMenu,
  getToppings,
  getMenuById,
  getAllMenus,
  getPopularMenus,
  getTopRestaurants,
};
