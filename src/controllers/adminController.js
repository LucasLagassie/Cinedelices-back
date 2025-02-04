import { HTTPError } from '../errors/httpError.js';
import {Recipe} from '../models/recipe.js';
import { User } from '../models/user.js';
import { MovieAndSerie } from '../models/movieAndSerie.js';
import { RecipeHasIngredient } from '../models/recipeHasIngredient.js';
import { sequelize } from '../models/sequelize.js';
import { RecipeCategory } from '../models/recipeCategory.js';
import { Ingredient } from '../models/ingredient.js';

export const adminController = {

   getAllUsers: async (req, res) => {

    const users = await User.findAll();
    return res.json(users);
},
    getUser: async (req, res) => {

        const user = await User.findByPk(req.params.id, {
            include: {
                association: "recipes",
            },
        });
        if(!user) {
            throw new HTTPError(404, "Utilisateur non trouvé");
        }
        return res.json(user);
    },
   
    deleteUsers: async(req, res) => {

        const user = await User.findByPk(req.params.id);
        if(!user) {
            throw new HTTPError(404, "Utilisateur non trouvé");
        }
        await user.destroy();
        return res.status(204).end();
    },

    getAllRecipes: async (req,  res) => {
        const recipes = await Recipe.findAll({
            include : [
                       {association: "ingredient"},
                       {association:    "recipeCategory"}
                    ]
        });
        return res.json(recipes);
    },

    createRecipe: async (req, res) => {
        const {
            name,
            description,
            instruction,
            time,
            difficulty,
            userId,
            movieId,
            recipeCategoryId,
            ingredient,
        } = req.body;
    
        console.log('body', req.body);
        try {
            // Étape 1 : Créer la recette
            const newRecipe = await Recipe.create({
                name,
                description,
                instruction,
                time,
                difficulty,
                userId,
                movieId,
                recipeCategoryId,
            });
    
            console.log('Nouvelle recette créée :', newRecipe);
    
            // Vérifiez que la recette a bien été créée
            if (!newRecipe.id) {
                throw new Error("L'ID de la recette n'a pas été généré.");
            }
    
            // Étape 2 : Ajouter les ingrédients un par un
            if (ingredient && Array.isArray(ingredient)) {
                const recipeIngredients = ingredient.map(ing => ({
                    recipeId: newRecipe.id, // ID de la recette créée
                    ingredientId: ing.id,   // ID de l'ingrédient
                    quantity: ing.quantity, // Quantité de l'ingrédient
                }));
                console.log('ingredient prêt à etre envoyé au bulkCreate', recipeIngredients);
                
            
                // Utilise bulkCreate pour insérer toutes les relations en une fois
                await RecipeHasIngredient.bulkCreate(recipeIngredients, {
                    fields: ['recipeId', 'ingredientId', 'quantity'],
                  });

            } else {
                console.warn('Aucun tableau d’ingrédients valide fourni.');
            }
            
            const fullRecipe = await Recipe.findByPk(newRecipe.id, {
                include: [{
                    association: 'ingredient', // Assurez-vous d'inclure les ingrédients
                }],
            });
            
            // Retourner une réponse en cas de succès
            return res.status(201).json({
                message: 'Recette créée avec succès.',
                recipe: fullRecipe,
            });
        } catch (error) {
            console.error('Erreur lors de la création de la recette :', error);
            return res.status(500).json({
                message: 'Erreur lors de la création de la recette',
                error: error.message,
            });
        }
    },
    
      

    editRecipe: async (req, res) => {
        const recipe = await Recipe.findByPk(req.params.id, {
          include: {
            association: 'ingredient', // Inclure les ingrédients associés à la recette
          }
        });
        
        if (!recipe) {
          throw new HTTPError(404, "Recette non trouvée");
        }
      
        const { 
          name, 
          description, 
          instruction, 
          time, 
          difficulty, 
          ingredient, 
          movieId, 
          recipeCategoryId 
        } = req.body;
      
        if (!name || !description || !instruction || !time || !difficulty) {
          throw new HTTPError(400, "Données incomplètes pour la mise à jour");
        }
      
        try {
          // Mise à jour de la recette
          await recipe.update({ name, description, instruction, time, difficulty, movieId, recipeCategoryId });
      
          // Mise à jour des relations ingrédients
          if (ingredient && Array.isArray(ingredient)) {
            // Supprimer les anciennes relations
            await RecipeHasIngredient.destroy({ where: { recipeId: recipe.id } });
      
            // Vérification du contenu des ingrédients
            console.log("Nouveaux ingrédients reçus :", ingredient);
      
            // Ajouter les nouvelles relations
            const newRelations = ingredient.map(({ ingredientId, quantity }) => ({
              recipeId: recipe.id,
              ingredientId,
              quantity,
            }));
      
            // Vérifier les relations à créer
            console.log("Relations à créer :", newRelations);
      
            await RecipeHasIngredient.bulkCreate(newRelations, {
              fields: ['recipeId', 'ingredientId', 'quantity'], // Ajout explicite des fields
            }); // Créer les nouvelles relations
          }
      
          // Récupérer la recette mise à jour avec ses ingrédients associés
          const updatedRecipe = await Recipe.findByPk(recipe.id, {
            include: {
              association: 'ingredient', // Inclure les ingrédients associés
            }
          });
      
          // Retourner la recette mise à jour avec les ingrédients dans la réponse
          return res.json({
            message: "Recette mise à jour avec succès.",
            recipe: updatedRecipe,  // La recette mise à jour avec les ingrédients
            recipeId: updatedRecipe.id
          });
        } catch (error) {
          console.error("Erreur lors de la mise à jour de la recette :", error);
          throw new HTTPError(500, "Erreur serveur lors de la mise à jour de la recette");
        }
      },
    

    deleteRecipe: async (req, res) => {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
        throw new HTTPError(404, "Recette non trouvée");
    }

    // Supprimer les relations dans recipe_has_ingredient
    await RecipeHasIngredient.destroy({
        where: { recipeId: recipe.id },
    });

    // Supprimer la recette
    await recipe.destroy();
    return res.status(204).end();
},

    getAllMoviesAndSeriesCategory: async (req, res) => {

        const MoviesAndSeriesCategory = await MovieAndSerie.findAll({
            include: {
                association: "movieAndSerieCategory"
            }
        })
        return res.json(MoviesAndSeriesCategory);

    
    },
    editMoviesAndSeriesCategory: async (req, res) => {

    const movieAndSerie = await MovieAndSerie.findByPk(req.params.id, {

        include: {
            association: "movieAndSerieCategory"
        }
    })

    if(!movieAndSerie) {
        throw new HTTPError(404, "Categorie non trouvée");
    }

    await movieAndSerie.update(req.body);
    return res.json(movieAndSerie);
    },

    destroyMoviesAndSeriesCategory: async (req, res) => {
        const movieAndSerie = await MovieAndSerie.findByPk(req.params.id, {
            include: {
                association: "movieAndSerieCategory"
            }
        });
        if(!movieAndSerie) {
            throw new HTTPError(404, "Categorie non trouvée");
        }
        await movieAndSerie.destroy();
        return res.status(204).end();
    }
}