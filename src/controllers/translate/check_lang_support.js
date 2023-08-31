const { OpenAI } = require("openai");
const configs = require("../../configs/openai");

const openai = new OpenAI({
  apiKey: configs.openAI,
});

async function _checkLangSupport(lang) {
  let res = await openai.chat.completions.create({
    model: configs.jsonOpenAIModel,
    messages: [
      {
        role: "user",
        content: configs.langSupportMessage(lang),
      },
    ],
  });
}

module.exports = async function (req, res) {
  let lang = req.params.lang;

  if (!lang) {
    res.status(400).send("No language provided");
  }

  try {
    let isSupported = await _checkLangSupport(lang);
    isSupported = isSupported.trim();

    if (isSupported != "true" && isSupported != "false") {
      console.log(isSupported);
      return res.status(500).send("Internal server error");
    }

    return res.status(200).json({ isSupported: isSupported == "true" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
