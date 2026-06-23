import AdminSkill from "../models/AdminSkill.js";

export const getSkills = async (req, res) => {
  const skills = await AdminSkill.find();
  res.json(skills);
};

export const addSkill = async (req, res) => {
  const skill = await AdminSkill.create(req.body);
  res.status(201).json(skill);
};

export const updateSkill = async (req, res) => {
  const skill = await AdminSkill.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(skill);
};

export const deleteSkill = async (req, res) => {
  await AdminSkill.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Skill deleted"
  });
};