import React, { Component } from "react";

import axios from "axios";
import ShoppingCart from "../helpers/ShoppingCart";
import PPHOptimizer from "../helpers/PPHOptimizer";
import RecipesTable from './recipesTable';
import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'


class Item {
  constructor(initialItemData) {
    // console.log("Initial Item Data", initialItemData)
    this.name = initialItemData['Name']
    this.marketData = initialItemData['Market Data']
    this.recipes = {}
    this.usedInRecipes = []
    this.activeRecipeId = null
    this.addRecipe(initialItemData['_id'], initialItemData['Name'], initialItemData['Recipe'], initialItemData['Quantity Produced'], initialItemData['Time to Produce'])
  }

  getMarketPrice() {
    return this.marketData['Market Price']
  }

  addRecipe(_id, productName, recipe, quantityProduced, timeToProduce) {
    if (this.recipes[_id] == null)
      this.recipes[_id] = new Recipe(productName, recipe, 'Buy', quantityProduced, timeToProduce)
    // this.printRecipes()
  }

  /**
   * 
   * @param {string} actionTaken // Craft or Buy 
   * @param {string} parentRecipeId // What recipe is this item used in?
   * @param {string} activeRecipeId // One of the recipes to craft this item
   */
  addUse(actionTaken, parentName, parentRecipeId, activeRecipeId) {
    this.usedInRecipes.push({
      actionTaken, 
      parentName,
      parentRecipeId
    })
    this.activeRecipeId = activeRecipeId
  }

  selectRecipe(recipeId) {
    this.activeRecipeId = recipeId
  }

  resetUses() {
    this.usedInRecipes = []
    this.activeRecipeId = null
  }

  printRecipes() {
    console.log('Recipes:', this.recipes)
  }
}

class Recipe {
  constructor(productName, ingredients, craftOrBuy = "Buy", quantityProduced = null, timeToProduce = null) {
    this.productName = productName
    this.craftOrBuy = craftOrBuy 
    this.ingredients = ingredients
    this.quantityProduced = quantityProduced
    this.timeToProduce = timeToProduce
  }

  printIngredients() {
    console.log('Ingredients:', this.ingredients)
  }
}

class RecipesDashboard extends Component {
  state = {
    items: null,    
  };

  componentDidMount() {
    this.allOptimalActionSets = null
    this.currentActionSet = null
    this.shoppingCart = new ShoppingCart(new PPHOptimizer());

    Events.scrollEvent.register('begin', function(to, element) {
      console.log('begin', arguments);
    });

    Events.scrollEvent.register('end', function(to, element) {
      console.log('end', arguments);
    });

    scrollSpy.update();
  }

  componentWillUnmount() {
    Events.scrollEvent.remove('begin');
    Events.scrollEvent.remove('end');
  }

  async componentDidUpdate(nextProps) {
    const { product: productName } = this.props;
    // Only update if the props changed
    if (nextProps.product != productName) {
      await this.getData(productName)
    }
  }

  /**
   * Call back-end API to retrives all recipes associated
   * @param {string} productName 
   */
  async getData(productName) {
    try {
      const { data: recipes } = await axios.get(
        "http://localhost:5000/api/recipes?item=" + productName
      );
      this.originalRecipesData = recipes
      this.sortRecipes(recipes);
      this.parseRecipes(recipes);
      console.log('Final Items', this.state.items)
    } catch (e) {
      console.log(e);
    }
  }

  sortRecipes(recipes) {
    for (let recipe of recipes) {
      // Sort ingredients
      recipe.Ingredients = recipe.Ingredients.sort(function (a, b) {
        return (
          b["Market Data"]["Market Price"] - a["Market Data"]["Market Price"]
        );
      });
    }
  }

  /**
   * Parses the information retrieved from the backend to produce the state object 'items'
   * @param {arr} recipes  
   */
  parseRecipes(recipes) {
    let items = {};
    console.log("recipes.jsx | Orignal Recipes Data: ", recipes)

    // Parse Recipe and prep for the display in table format
    for (const recipe of recipes) {
      this.addItem(items, recipe);

      for (let ingredient of recipe.Ingredients) {
        this.addItem(items, ingredient);
      }
    }

    // // Get optimal actions
    this.allOptimalActionSets = this.shoppingCart.optimizer.findOptimalActionSets(this.props.product, items);
    
    this.setState({items})
    this.resetToOptimal()
    return items
  }

  /**
   * 
   * @param {object} items {key: item name, value: Item object}
   * @param {*} item 
   */
  addItem(items, item) {
    if (items[item.Name] == null) {
      items[item.Name] = new Item(item);
    } else {
      items[item.Name].addRecipe(item['_id'], item['Name'], item.Recipe, item['Quantity Produced'], item['Time to Produce']);
    }

    // console.log('item name', item.Name)
  }

  /**
   * Callback function for RecipesTable.onRecipeClick
   * Updates the 'this.items' object in this component's state, which updates the RecipesTable(s)
   * @param {string} itemName The name of the item
   * @param {string} recipeId The id of the recipe selected
   */
  selectRecipe(itemName, recipeId) {
    let items = {...this.state.items}

    // If the root recipe was selected, change out the current action set
    if (itemName == this.props.product) {
      // Select Recipe
      console.log('recipesDashboard.jsx | recipeId:', recipeId)
      console.log('recipesDashboard.jsx | All optimal action sets:', this.allOptimalActionSets)
      this.currentActionSet = this.allOptimalActionSets[recipeId]
      console.log('recipesDashboard.jsx | Current action set:', this.currentActionSet)

      // Calculate costs
      // const {recipeIdx: rootRecipeIdx} = this.currentActionSet
      console.log('recpiesDashboard.jsx | Items and itemName', items, itemName)
      const shoppingCartData = this.shoppingCart.calculateCostsWithActionSet(this.currentActionSet, items[itemName], 5);
      console.log('Shopping Cart Data', shoppingCartData);
    } else {
      // Select Recipe
      // this.currentActionSet.optimalActions[itemName]...['Craft'].recipe /// update recipe

      // Calculate costs
      // const {recipeIdx: rootRecipeIdx} = this.currentActionSet
      // const shoppingCartData = this.shoppingCart.calculateCostsWithActionSet(this.currentActionSet, this.originalRecipesData[rootRecipeIdx], 5);
      // console.log('Shopping Cart Data 2', shoppingCartData);
    }

    items[itemName].selectRecipe(recipeId)
    this.startRecursiveReset(items[itemName], items)
    console.log('After reset', items)

    // Update active recipes
    const optimalActions = this.currentActionSet.optimalActions[itemName]
    let action = optimalActions['Craft']['monetaryCost'] < optimalActions['Buy']['monetaryCost'] ? 'Craft' : 'Buy'
    console.log('Optimal actions', optimalActions)
    items = this.cascadeActiveRecipeWithOptimalActions(
      this.currentActionSet.optimalActions, 
      itemName,
      action,
      items
    );
    console.log('After cascade', items)
      
    this.setState({items})
    
  }

  /**
   * 
   * @param {object} item Instance of the Item object 
   * @param {object} items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  startRecursiveReset(item, items) {
    const recipeId = item.activeRecipeId
    if (recipeId == null) return;
    for (const ingredient of item.recipes[recipeId].ingredients) {
      
      const ingredientName = ingredient['Item Name']
      console.log(ingredientName)
      this.recursivelyResetItemUses(items[ingredientName], items)
    }
  }
  
  /**
   * 
   * @param {object} item Instance of the Item object 
   * @param {object} items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  recursivelyResetItemUses(item, items) {
    item.resetUses()
    const recipeId = item.activeRecipeId
    if (recipeId != null) {
      for (const ingredient of item.recipes[recipeId].ingredients) {
        const ingredientName = ingredient['Item Name']
        console.log(ingredientName)
        this.recursivelyResetItemUses(items[ingredientName], items)
      }
    }
  }

  selectCraftOrBuy(itemName, craftOrBuy) {
    
  }

  resetToOptimal(items = this.state.items) {
    // TODO: Move to separate method?
    // Get optimal action for each recipe of the root product
    const bestRecipeActions = this.allOptimalActionSets
    const {product} = this.props
    // Choose most optimal recipe and the optimal actions for profit
    let bestActionSet = null
    for (let actionSetIdx in bestRecipeActions) {
      const actionSet = bestRecipeActions[actionSetIdx]
      if (bestActionSet == null) { bestActionSet = actionSet; continue; } 

      const oldCraftAction = bestActionSet.optimalActions[product]['Craft']
      const newCraftAction = actionSet.optimalActions[product]['Craft']
      const marketPrice = items[product].getMarketPrice()
      if (oldCraftAction.calculateProfit(marketPrice) < newCraftAction.calculateProfit(marketPrice))
        bestActionSet = actionSet
    }

    console.log('Best Action Set', bestActionSet)
    this.selectRecipe(product, bestActionSet['optimalActions'][product]['Craft'].recipe_id)
  }

  
  /**
 * Selects the RecipeTables that should be active by modifying the 'this.state.items' object
 * @param {object} optimalActions The set of actions determined by the user
 * @param {string} currentItem Name of the item
 * @param {string} actionTaken 'Buy' or 'Craft'
 * @param {object} items  this.state.items
 */
  cascadeActiveRecipeWithOptimalActions(optimalActions, currentItem, actionTaken, items = {...this.state.items}, parent = {}) {
    const {parentRecipeId, parentName} = parent

    const action = optimalActions[currentItem][actionTaken];
    console.log('action', action)
    if (action == null) return items; // Base case. Return when there is no valid action

    console.log('aaa parent recipeId', parentRecipeId)
    items[currentItem].addUse(actionTaken, parentName, parentRecipeId, action.recipe_id) // e.g. Item.addUse('Craft', parentRecipeId, action's recipe Id which may be null if Buying)
    if (actionTaken == "Buy") return items;

    // Recursively update activeRecipes dictionary using more calls to cascadeActiveRecipeWithOptimalActions
    for (const ingredient of action.recipe.ingredients) {
      const name = ingredient["Item Name"];
      const ingredientAction = ingredient["Action"];
      const newParent = {
        parentRecipeId: action.recipe_id,
        parentName: currentItem
      }
      this.cascadeActiveRecipeWithOptimalActions(
        optimalActions,
        name,
        ingredientAction,
        items,
        newParent
      );
    }

    return items
  }

  renderTables() {
    if (this.state.items == null) {
      return (
        <h2 style={{ "text-align": "center" }}>
          Use the search bar to select a recipe
        </h2>
      );
    }
    return (
      <div>
        {Object.keys(this.state.items).map((productName, index) => {
          const item = this.state.items[productName]
          
          return (
            <>
              {item.usedInRecipes.length > 0 || item.activeRecipeId != null ? (
                <RecipesTable productName={productName} item={item} onRecipeClick={()=>console.log("On Recipe Click")} onCraftOrBuyClick={()=>console.log("On Craft or Buy Click")}></RecipesTable>
              ) : null}
            </>
          );
        })}

      </div>
    );
  }

  render() {
    return <div>{this.renderTables()}</div>;
  }
}

export default RecipesDashboard;
