// (C) 2019 GoodData Corporation
/* eslint-disable import/no-unassigned-import */
import "@testing-library/jest-dom/extend-expect";
import * as raf from "raf";
import { TextEncoder } from "util";

raf.polyfill();

global.TextEncoder = TextEncoder;
