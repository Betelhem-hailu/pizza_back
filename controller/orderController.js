const db = require("../models");
const { Op } = require('sequelize');

const createOrder = async (req, res) => {
  const { menuItems, restaurantId} = req.body;
  const { userId } = req.user;
  const transaction = await db.sequelize.transaction();

  try {
    let totalPrice = 0;
    const createdOrderItems = [];

    const newOrder = await db.Order.create({
      customerId: userId,
      restaurantId,
      status: "pending",
      totalPrice,
    }, { transaction });

    for (const menuItem of menuItems) {
      const { menuId, quantity, toppings } = menuItem;
      const menu = await db.Menu.findByPk(menuId);
      if (!menu) {
        return res.status(400).json({ error: "Menu not found" });
      }

      if (menu.restaurantId !== restaurantId) {
        return res.status(400).json({
          error: "Menu item does not belong to the associated restaurant",
        });
      }

      let orderItemPrice = menu.price * quantity;

      const orderItem = await db.OrderItem.create({
        orderId: newOrder.id,
        menuId: menu.id,
        quantity: quantity,
        price: orderItemPrice,
      });

      const toppingIds = [];
      if (toppings && toppings.length > 0) {
        for (const toppingId of toppings) {
          const topping = await db.Topping.findByPk(toppingId);
          toppingIds.push(topping.id);
        }
      }

      // if(toppings){
        await orderItem.addToppings(toppingIds, { transaction });
      // }

      totalPrice += orderItemPrice;
      createdOrderItems.push(orderItem);
    }
    await newOrder.update({totalPrice}, {transaction} );
    await transaction.commit();

    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
      items: createdOrderItems,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ error: "Failed to place order" });
  }
};

const getOrderHistory = async (req, res) => {
  const customerId = req.user.userId;

  try {
    const orders = await db.Order.findAll({
      where: { customerId },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Menu,
              as: "pizza",
            },
            {
              model: db.Topping,
              as: "toppings",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const flattenedOrders = orders.map((order) => {

      return {
        orderId: order.id,
        createdAt: order.createdAt,
        status: order.status,
        orderItems: order.orderItems.map(orderItem => ({
          orderItemId: orderItem.id,
          quantity: orderItem.quantity,
          pizzaName: orderItem.pizza.name,
          pizzaPrice: orderItem.price,
          pizzaImage: orderItem.pizza.image,
          toppings: orderItem.toppings.map(topping => topping.name).join(", ") || null
        }))
      };
    });
    
    return res.status(200).json({ orders: flattenedOrders });
  } catch (error) {
    console.error("Error getting order history:", error);
    return res.status(500).json({ error: "Failed to get order history" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    const order = await db.Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ status });
    return res
      .status(200)
      .json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
};

const getOrdersByRestaurantId = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { status, startDate, endDate, searchTerm } = req.query;

  const whereClause = {
    restaurantId,
  };

  if (status) {
    whereClause.status = status;
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt[Op.lte] = new Date(endDate);
    }
  }

  const orderItemInclude = {
    model: db.OrderItem,
    as: "orderItems",
    attributes: ["quantity"],
    include: [
      {
        model: db.Menu,
        as: "pizza",
        attributes: ["name", "price", "image"], // Get pizza name, price, and image
        where: {},
      },
      {
        model: db.Topping,
        as: "toppings",
        attributes: ["name"], // Get topping names
      },
    ],
  };

  if (searchTerm) {
    orderItemInclude.include[0].where = {
      name: { [Op.iLike]: `%${searchTerm}%` },
    };
  }

  try {
    const orders = await db.Order.findAll({
      where: whereClause,
      attributes: ["createdAt", "status", "id"], 
      include: [
        orderItemInclude,
        {
          model: db.Customer,
          as: "customer",
          attributes: ["phoneNumber"], 
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const flattenedOrders = orders
    .filter(order => order.orderItems && order.orderItems.length > 0)
    .map(order => ({
      orderId: order.id,
      createdAt: order.createdAt,
      status: order.status,
      customerPhoneNumber: order.customer.phoneNumber,
      orderItems: order.orderItems.map(orderItem => ({
        orderItemId: orderItem.id,
        quantity: orderItem.quantity,
        pizzaName: orderItem.pizza.name,
        pizzaPrice: orderItem.pizza.price,
        pizzaImage: orderItem.pizza.image,
        toppings: orderItem.toppings.map(topping => topping.name).join(", ") || null
      }))
    }));

    if (!flattenedOrders || flattenedOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this restaurant." });
    }

    return res.status(200).json({ orders: flattenedOrders });
  } catch (error) {
    console.error("Error getting orders by restaurant id:", error);
    return res
      .status(500)
      .json({ error: "Failed to get orders by restaurant id" });
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  updateOrderStatus,
  getOrdersByRestaurantId,
};
