import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import SearchBar from "../components/SearchBar";
import RecipesDashboard from "../components/RecipesDashboard";
import { Container } from "react-bootstrap";
import { withRouter } from "react-router";
import { action as toggleMenu } from "redux-burger-menu";

const RecipesPage = (props) => {
  const [product, setProduct] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setProduct(props.match.params.item);
    dispatch(toggleMenu(true));
    return () => {
      dispatch(toggleMenu(false));
    };
  }, [dispatch, props.match.params.item]);

  useEffect(() => {
    setProduct(props.match.params.item);
  }, [props.location, props.match.params.item]);

  return (
    <Container fluid id="outer-container">
      <RecipesDashboard product={product} setProduct={setProduct} />
    </Container>
  );
};
export default withRouter(RecipesPage);
