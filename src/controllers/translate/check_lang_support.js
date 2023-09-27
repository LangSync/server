const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const Joi = require("joi");

async function _checkLangsSupport(langs) {
  const openai = new OpenAI({
    apiKey: configs.openAI,
  });

  let res = await openai.chat.completions.create({
    model: configs.jsonOpenAIModel,
    temperature: 0.9,
    messages: [
      {
        role: "assistant",
        content: configs.langsSupportInstruction,
      },
      {
        role: "user",
        content: langs.join(", "),
      },
    ],
  });

  let con = res.choices[0].message.content;

  console.log(con);

  return con.split(", ");
}

module.exports = async function (req, res) {
  let schema = Joi.object({
    langs: Joi.array().items(Joi.string().required()).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error });
  }

  try {
    let checkResult = await _checkLangsSupport(value.langs);

    return res.status(200).json({ checkResultList: checkResult });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
