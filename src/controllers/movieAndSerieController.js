import { MovieAndSerie } from "../models/index.js";
import { HTTPError } from "../errors/httpError.js";

export const getAll = async (req, res) => {
  const movieAndSeries = await MovieAndSerie.findAll({
    include: [
      {
        association: "recipes",
      },
      {
        association: "movieAndSerieCategory",
      },
    ],
  });
  return res.json(movieAndSeries);
};

export const getOne = async (req, res) => {
  const movieAndSerie = await MovieAndSerie.findByPk(req.params.id, {
    include: {
      association: "recipes",
    },
  });
  if (!movieAndSerie) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  return res.json(movieAndSerie);
};
