const { Menu, Topping } = require("../models");

const registerMenu = async (newMenu, transaction) => {
    const { name, price, image, restaurantId } = newMenu;

    const menu = await Menu.create(
      { name, price, image, restaurantId },
      { transaction }
    );
    return menu;
  };

const createTopping = async (name, transaction) => {
  let topping = await Topping.findOne({ where: { name } });

  if (!topping) {
      topping = await Topping.create({ name }, { transaction });
  }

  return topping; 
}

module.exports = {registerMenu, createTopping}