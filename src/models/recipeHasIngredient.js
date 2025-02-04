import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelize.js";
import { Recipe } from "./recipe.js";
import { Ingredient } from "./ingredient.js";

export class RecipeHasIngredient extends Model {}

RecipeHasIngredient.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Recipe,
        key: "id",
      },
      field: "recipe_id", // Spécifie le nom exact de la colonne en base
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ingredient,
        key: "id",
      },
      field: "ingredient_id", // Spécifie le nom exact de la colonne en base
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "recipe_has_ingredient",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["recipeId", "ingredientId"], // Pas besoin de "field" ici, Sequelize le comprend via le modèle
      },
    ],
  }
);
