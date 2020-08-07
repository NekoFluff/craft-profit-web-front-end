import React, { Component } from "react";
import MaterialTable, { MTableToolbar } from "material-table"; // https://material-table.com/#/
import tableIcons from "../helpers/tableIcons";
import { Chip } from "@material-ui/core";
import "../css/RecipeTable.css";
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import { ButtonGroup, Button, Badge, Accordion, Card } from "react-bootstrap";
import ProfitCalculator from './../helpers/ShoppingCartProfitCalculator';

class RecipesTable extends Component {
  state = {};

  renderDetailsButton(shoppingCartData) {

    let active = this.props.detailsShown ? "0" : null

    return (
      <Accordion defaultActiveKey={active}>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} onClick={(e)=>{this.props.onProfitDetailsButtonPressed(this.props.item.name)}} variant="link" eventKey="0">
              Profit Details
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>{this.renderBadges(shoppingCartData)}</Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="1">
              Click me!
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="1">
            <Card.Body>Hello! I'm another body</Card.Body>
          </Accordion.Collapse>
        </Card> */}
      </Accordion>
    );
  }

  renderBadges(shoppingCartData) {
    // const { shoppingCartData, marketData, valuePackEnabled } = this.props.item;
    const marketPrice = this.props.item.getMarketPrice();
    let {
      expectedCount: count,
      individualPrice,
      cumulativeTimeSpent,
    } = shoppingCartData;

    individualPrice = parseInt(individualPrice);

    const {profit, profitPerSecond} = ProfitCalculator.calculateProfitValuesForItem(this.props.item)

    return (
      <div
        style={{
          paddingLeft: "20px",
          paddingTop: "0px",
          paddingBottom: "20px",
        }}
      >
        <h4>
          {" "}
          <Badge variant="danger">
            {`Market Price: ${marketPrice} silver`}
          </Badge>
        </h4>

        {/* Profit */}
        <h4>
          <Badge variant="success">{`Total Profit: ${Math.floor(
            profit * count
          )} silver`}</Badge>
        </h4>
        <h4>
          <Badge variant="success">{`Profit per item: ${Math.floor(
            profit
          )} silver`}</Badge>
        </h4>
        <h4>
          <Badge variant="success">{`Profit per sec: ${profitPerSecond} silver/second`}</Badge>
        </h4>

        {/* Silver spent */}
        <h4>
          <Badge variant="warning">
            {`${individualPrice * count} silver spent to get these materials`}
          </Badge>
        </h4>
        <h4>
          <Badge variant="warning">{`${individualPrice} silver spent per item.`}</Badge>
        </h4>

        {/* Time spent */}
        <h4>
          <Badge variant="info">{`${(cumulativeTimeSpent * count).toFixed(
            2
          )} total seconds crafting`}</Badge>
        </h4>
        <h4>
          <Badge variant="info">{`${cumulativeTimeSpent.toFixed(
            2
          )} seconds spent to craft one of these items`}</Badge>
        </h4>
      </div>
    );
  }

  /**
   * Renders the chips right below the title
   * @param {[Recipe]} allRecipes An array of Recipe objects
   * @param {string} selectedRecipeId The selected recipe. If null, the action is 'Buy'
   * @param {} productName The name of the product being bought/crafted
   */
  renderChips(allRecipes, selectedRecipeId, productName) {
    return (
      <div
        id="toolbar-container"
        style={{
          padding: "10px 0px 10px 20px",
        }}
      >
        {/* <Chip clickable={false} style={{borderRadius: "3px"}} label={'Buy or Craft?:'}></Chip> */}
        <Chip
          className="recipeChip"
          clickable
          label="Buy"
          color={selectedRecipeId == null ? "primary" : "secondary"}
          style={{ marginRight: 5 }}
          onClick={() => {
            console.log(`Clicked buy | id: ${productName}`);
            this.props.onBuyClick(productName);
          }}
        />
        {Object.keys(allRecipes).map((recipe_id, index) => {
          if (allRecipes[recipe_id].quantityProduced == null) return null;
          const isSelected = selectedRecipeId == recipe_id;
          return (
            <Chip
              className="recipeChip"
              clickable
              label={`Recipe #${index}`}
              color={isSelected ? "primary" : "secondary"}
              style={{ marginRight: 5 }}
              onClick={() => {
                console.log(`Clicked recipe# ${index} | id: ${recipe_id}`);
                this.props.onRecipeClick(productName, recipe_id);
              }}
            />
          );
        })}
      </div>
    );
  }

  renderParentLink(parentName) {
    if (parentName == null) return null;
    return (
      <div
        id="toolbar-subtitle"
        style={{ fontSize: "0.8em", paddingLeft: "25px" }}
      >
        {"for "}
        <Link
          activeClass="active"
          className="scrollLink text-primary"
          to={parentName}
          spy={true}
          smooth={true}
          duration={500}
        >
          {parentName}
        </Link>
      </div>
    );
  }

  render() {
    const { productName, item } = this.props;
    const {
      shoppingCartData,
      recipes: allRecipes,
      activeRecipeId: selectedRecipeId,
    } = item;
    const selectedRecipe =
      selectedRecipeId != null ? allRecipes[selectedRecipeId] : null;
    let rowData = [];

    if (selectedRecipe != null) rowData = [...selectedRecipe.ingredients];

    for (let ingredient of rowData) {
      ingredient["Total Needed"] =
        ingredient["Amount"] * shoppingCartData[0].craftCount;
    }

    // console.log("recipesTable.jsx | RENDERING ITEM", item)
    return (
      <>
        {item.usedInRecipes.map(
          ({ actionTaken: craftOrBuy, parentRecipeId, parentName }, index) => {
            let correctShoppingCartData;

            for (const data of shoppingCartData) {
              if (data.for == parentName) {
                correctShoppingCartData = data
                break
              }
            } 

            return (
              <Element name={item.name} className="m-4">
                <MaterialTable
                  name={item.name}
                  icons={tableIcons}
                  columns={[
                    {
                      title: `Name`,
                      field: "Item Name",
                      render: (rowData) => (
                        <Link
                          activeClass="active"
                          className="scrollLink text-primary"
                          to={rowData["Item Name"]}
                          spy={true}
                          smooth={true}
                          duration={500}
                        >
                          {rowData["Item Name"]}
                        </Link>
                      ),
                    },
                    { title: "Amount per Craft", field: "Amount" },
                    { title: "Total Needed", field: "Total Needed" },
                  ]}
                  data={selectedRecipe != null ? rowData : []} // TODO: Which recipe to choose?
                  // title={`${productName}` + (parentName != null ? `... for ${parentName}` : '')}
                  title={`${productName} (x${correctShoppingCartData.expectedCount})`}
                  options={{
                    search: false,
                    paging: false,
                    header: selectedRecipe != null ? true : false,
                  }}
                  localization={{
                    body: {
                      emptyDataSourceMessage:
                        "You must gather/purchase this ingredient",
                    },
                  }}
                  components={{
                    Toolbar: (props) => {
                      return (
                        <div
                          id="toolbar"
                          style={{
                            backgroundColor: "rgb(230, 230, 230)",
                          }}
                        >
                          <MTableToolbar
                            {...props}
                            style={{ "text-align": "center" }}
                          />
                          {/* <div {...props}>{props.title}</div> */}
                          {this.renderParentLink(parentName)}
                          {this.renderChips(
                            allRecipes,
                            selectedRecipeId,
                            productName
                          )}
                          {this.renderDetailsButton(correctShoppingCartData)}
                        </div>
                      );
                    },
                  }}
                />
              </Element>
            );
          }
        )}
      </>
    );
  }
}

export default RecipesTable;
