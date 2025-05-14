const Registration = require("../models/registrationModel");

const createRegistration = async (req, res) => {
  const { tourDateId } = req.body;
  if (!tourDateId)
    return res.status(400).json({ message: "Please provide tourDateId" });

  try {
    const registration = await Registration.create({
      userId: req.user.id,
      tourDateId,
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.getAll();
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const registrations = await Registration.getByTourId(tourId);
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByUserId = async (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== "admin" && Number(userId) !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: cannot access other users' registrations" });
  }

  try {
    const registrations = await Registration.getByUserId(userId);
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  const { registrationId } = req.params;
  const { status } = req.body;

  if (!["pending", "approved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const registration = await Registration.updateStatus(
      registrationId,
      status
    );
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });
    res.status(200).json({ status: "success", data: registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationDate = async (req, res) => {
  const { registrationId } = req.params;
  const { tourDateId } = req.body;
  if (!tourDateId)
    return res.status(400).json({ message: "Please provide tourDateId" });

  try {
    const registration = await Registration.getById(registrationId);
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });
    if (registration.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your registration" });
    }

    const updated = await Registration.updateDate(registrationId, tourDateId);
    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  const { registrationId } = req.params;
  try {
    const registration = await Registration.getById(registrationId);
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });
    if (registration.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your registration" });
    }

    await Registration.delete(registrationId);
    res
      .status(200)
      .json({
        status: "success",
        message: "Registration cancelled successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationsByTourId,
  getRegistrationsByUserId,
  updateRegistrationStatus,
  updateRegistrationDate,
  cancelRegistration,
};
