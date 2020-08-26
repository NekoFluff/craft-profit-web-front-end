// Other packages
import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { withRouter, RouteComponentProps } from "react-router";

// My components
import MostSearchedItemsTable from "../components/mostSearchedItemsTable";
import SearchBar from "../components/searchBar";
import PPSTable from "../components/ppsTable";
import MyNavBar from "../components/navbar";

type HomePageProps = {} & RouteComponentProps<{ item: string }>;

type HomePageState = {};

class HomePage extends Component<HomePageProps, HomePageState> {
  render() {
    return (
      <React.Fragment>
        <MyNavBar></MyNavBar>
        <h1 className="p-3" style={{ textAlign: "center" }}>
          Craft Profit v0.2.0
        </h1>
        <Container>
          <Row className="justify-content-center">
            <Col>
              <SearchBar />
            </Col>
          </Row>
          <Row>
            <Col>
              <PPSTable />
            </Col>
          </Row>
          <Row>
            <Col>
              <MostSearchedItemsTable></MostSearchedItemsTable>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default withRouter(HomePage);
