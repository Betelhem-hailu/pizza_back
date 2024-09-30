const db = require("../models");

const createOrder = async (req, res) => {
  const { menuItems, toppings } = req.body;
  const { userId, restaurantId } = req.user;

  try {
    let totalPrice = 0;
    const createdOrderItems = [];

    const newOrder = await db.Order.create({
        userId,
        restaurantId,
        status: "pending",
        totalPrice,
      });

    for (const menuItem of menuItems) {
      const { menuId, quantity } = menuItem;
      const menu = await db.Menu.findByPk(menuId);
      if (!menu) {
        return res.status(400).json({ error: "Menu not found" });
      }

      if (menu.restaurantId !== restaurantId) {
        return res.status(400).json({ error: 'Menu item does not belong to the associated restaurant' });
      }

      let orderItemPrice = menu.price * quantity;

      const orderItem = await db.OrderItem.create({
        orderId: newOrder.id,
        menuId: menu.id,
        quantity: quantity,
        price: orderItemPrice,
      });

      if (toppings && toppings.length > 0) {
        for (const toppingId of toppings) {
          const topping = await db.Topping.findByPk(toppingId);
          if (topping) {
            await orderItem.addTopping(topping);
          }
        }
      }

      totalPrice += orderItemPrice;
      createdOrderItems.push(orderItem);
    }
    await newOrder.update({ totalPrice });

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
  const userId = req.user.userId;

  try {
    const orders = await db.Order.findAll({
      where: { userId },
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
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error getting order history:", error);
    return res.status(500).json({ error: "Failed to get order history" });
  }
};

const updateOrderStatus = async (req, res) =>{
    const { orderId, status } = req.body;
    
    try {
        const order = await db.Order.findByPk(orderId);
        if (!order) {
        return res.status(404).json({ error: "Order not found" });
        }
    
        await order.update({ status });
        return res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ error: "Failed to update order status" });
    }
};

const getOrdersByRestaurantId = async (req, res) => {
    const restaurantId = req.user.restaurantId;
    
    try {
        const orders = await db.Order.findAll({
        where: { restaurantId },
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

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this restaurant.' });
          }
    
        return res.status(200).json({ orders });
    } catch (error) {
        console.error("Error getting orders by restaurant id:", error);
        return res.status(500).json({ error: "Failed to get orders by restaurant id" });
    }
}

module.exports = { createOrder, getOrderHistory, updateOrderStatus, getOrdersByRestaurantId };
