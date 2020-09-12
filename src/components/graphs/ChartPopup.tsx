// scss
import "../../scss/ChartPopup.scss";

import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import numberWithCommas from "../../helpers/numberWithCommas";

export type PopupData = {
  location: [number, number];
  name: string;
  value: number;
  maxValue: number;
  examples: string[];
  shoppingCartData: any;
};

type ChartPopupProps = {
  data: PopupData;
  isHidden: boolean;
  width?: number;
  height?: number;
  topOffset?: number;
  isVertical?: boolean;
};

const ChartPopup: React.FC<ChartPopupProps> = (props) => {
  const {
    data,
    isHidden,
    width = 250,
    height = 150,
    topOffset = 0,
    isVertical = false,
  } = props;
  data.examples = data.examples.filter((text) => {
    if (text != "") return text;
  });
  const popupSpring: any = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      // transform: `translate(${data.location[0] - width / 2}px, ${Math.round(
      //   data.location[1] + topOffset
      // )}px)`,
      transform: isVertical
        ? `translate(${data.location[0] - width / 2}px,${
            topOffset - height + data.location[1]
          }px)`
        : `translate(${data.location[0] - width - 20}px,${
            topOffset - height / 2 + data.location[1] + 22
          }px)`,
      opacity: isHidden ? 0 : 1,
    },
  });

  const percentage = ((data.value / data.maxValue) * 100).toFixed(2);

  const numberText =
    data.shoppingCartData.action === "Buy"
      ? ` - [Buy  ${numberWithCommas(data.shoppingCartData.expectedCount)}]`
      : " - [Craft]";
  return (
    <React.Fragment>
      <animated.div
        className="chart-popup"
        style={{ ...popupSpring, width, height }}
      >
        <div
          className="chart-popup__triangle"
          style={
            isVertical
              ? { bottom: "0", left: "50%" }
              : { bottom: "calc(50% - 6px)", left: "100%" }
          }
        ></div>

        <div className="chart-popup__title">{`${data.name}${numberText}`} </div>
        <div className="chart-popup__title">
          {`${numberWithCommas(data.value)} Silver`}{" "}
        </div>
        <div className="chart-popup__examples" id="examples">
          {data.examples.length > 0 && <b>Used In:</b>}
          {data.examples.map((text, index) => {
            return <div>{text}</div>;
          })}
        </div>
        {/* <div className="chart-popup__value">
        ...of <span id="count"></span> uses
      </div> */}
        <div className="chart-popup__bar-value">
          <b>
            <span id="chart-popup__bar-value">{percentage}</span>%
          </b>{" "}
          of the total cost
        </div>
        <div className="chart-popup__bar">
          <div
            className="chart-popup__bar-item"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </animated.div>
    </React.Fragment>
  );
};

export default ChartPopup;