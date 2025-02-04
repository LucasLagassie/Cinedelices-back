import {
  Recipe,
  RecipeHasIngredient,
  RecipeCategory,
  MovieCategory,
  MovieHasCategory,
  Ingredient,
  MovieAndSerie,
} from "../models/index.js";
import { HTTPError } from "../errors/httpError.js";

export const getAll = async (req, res) => {
  const recipes = await Recipe.findAll({
    include: [
      {
        association: "ingredient",
      },
      {
        association: "recipeCategory",
      },
      {
        association: "movieAndSerie",
      },
    ],
  });
  return res.json(recipes);
};

export const getOne = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id, {
    include: {
      association: "ingredient",
      through: { attributes: [] },
    },
  });
  if (!recipe) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  return res.json(recipe);
};

export const createOne = async (req, res) => {
  const recipe = await Recipe.create(req.body);
  return res.status(201).json(recipe);
};

export const modifyOne = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id, {
    include: {
      association: "ingredient",
      through: { attributes: [] },
    },
  });

  if (!recipe) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }

  await recipe.update(req.body);
  return res.json(recipe);
};

export const deleteOne = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id);
  if (!recipe) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  await recipe.destroy();
  return res.status(204).end();
};

export const associateOneWithCategory = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id);
  if (!recipe) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  await recipe.setRecipeCategory(req.body);
  return res.json(recipe);
};

export const updateOne = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id, {
    include: [
      { association: "ingredient" },
      {
        association: "recipeCategory",
      },
    ],
  });
  if (!recipe) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  await recipe.update(req.body);
  return res.json(recipe);
};

export const getRecipesByMovie = async (req, res) => {
  const movies = await MovieAndSerie.findByPk(req.params.id, {
    include: {
      association: "recipes",
      through: { attributes: [] },
    },
  });

  if (!movies) {
    throw new HTTPError(404, "Oups! Cette scène semble manquer au scénario");
  }
  return res.json(movies.recipes);
};

// Affichage des dernières recettes ajoutées
export const getLatestRecipes = async (req, res) => {
  try {
    const latestRecipes = await Recipe.findAll({
      order: [["createdAt", "DESC"]],
      limit: 6,
    });
    return res.json(latestRecipes);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la récupération des dernières recettes.",
    });
  }
};
