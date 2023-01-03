// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Drilling", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("implicit drill to attribute url", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/implicit-drill-to-attribute-url");
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute in drill modal", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 1);

            const drillModalTable = new Table(".s-drill-modal-dialog");

            drillModalTable.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });
    });
});
