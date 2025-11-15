import Language from "../models/languageModel.js";

// ✅ CREATE new mainCategory (and optional subLanguages)
export const createLanguage = async (req, res) => {
  try {
    const { mainCategory, subLanguages } = req.body;

    if (!mainCategory) {
      return res.status(400).json({ success: false, message: "mainCategory is required" });
    }

    const newLanguage = new Language({
      mainCategory,
      subLanguages: subLanguages || [],
    });

    await newLanguage.save();
    res.status(201).json({ success: true, data: newLanguage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET all
export const getLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, languages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ UPDATE a specific mainCategory
export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainCategory, subLanguages } = req.body;

    const updatedLanguage = await Language.findByIdAndUpdate(
      id,
      { mainCategory, subLanguages },
      { new: true, runValidators: true }
    );

    if (!updatedLanguage) {
      return res.status(404).json({ success: false, message: "Language not found" });
    }

    res.status(200).json({ success: true, data: updatedLanguage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE entire mainCategory
export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Language.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Language not found" });
    }

    res.status(200).json({ success: true, message: "Language deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE a specific subLanguage inside a mainCategory
export const deleteSubLanguage = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ success: false, message: "Language not found" });
    }

    language.subLanguages = language.subLanguages.filter(
      (sub) => sub._id.toString() !== subId
    );

    await language.save();
    res.status(200).json({
      success: true,
      message: "SubLanguage deleted successfully",
      data: language,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADD new language
export const addLanguage = async (req, res) => {
  try {
    const { mainCategory, subLanguages } = req.body;

    if (!mainCategory || !subLanguages || subLanguages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Main category and at least one sublanguage are required",
      });
    }

    const newLang = new Language({ mainCategory, subLanguages });
    await newLang.save();

    res.status(201).json({
      success: true,
      message: "Language added successfully",
      data: newLang,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, languages });
  } catch (error) {
    console.error("❌ Error fetching languages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
