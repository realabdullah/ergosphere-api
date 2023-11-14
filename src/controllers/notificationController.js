// import any necessary modules and models
const Notification = require('../models/notification');
import 'socket.io';

// function to add a new notification
export const addNotification = async (req, res) => {
    try {
        const {message, userId} = req.body;
        const notification = new Notification({message, userId});
        await notification.save();

        // emit the new notification to the client
        const io = req.app.get('socketio');
        io.emit('newNotification', notification);

        res.status(201).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// function to get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const {userId} = req.params;
        const notifications = await Notification.find({userId});
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// function to delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const {id} = req.params;
        await Notification.findByIdAndDelete(id);

        // emit the deleted notification to the client
        const io = req.app.get('socketio');
        io.emit('deletedNotification', id);

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};
