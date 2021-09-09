import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Bills from "../containers/Bills";
import userEvent from "@testing-library/user-event";
import Router from "../app/Router";
import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";
import Logout from "../containers/Logout";
import { setLocalStorage, setLocation } from "../__mocks__/Bills.helper";

// Mock Logout function
jest.mock("../containers/Logout");

// Set Information about Employee in LocalStorage
setLocalStorage("user", "Employee", "a@a");

// Initialize constants to use in test code
const onNavigate = () => {
  document.body.innerHTML = ROUTES({});
};
const firestore = null;
const localStorage = window.localStorage;

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      // Create bills list interface
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;

      // Check if loading text is "Loading..."
      const loadingText = screen.getAllByText("Loading...");
      expect(loadingText).toBeTruthy();
    });
  });

  describe("When I am on Bills Page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      // Create bills list interface
      const html = BillsUI({ error: "some error message" });
      document.body.innerHTML = html;

      // Check if error text is "Erreur..."
      const errorText = screen.getAllByText("Erreur");
      expect(errorText).toBeTruthy();
    });
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // Set location on Bills page
      const billsPathname = ROUTES_PATH["Bills"];
      setLocation(billsPathname);

      // Mock get Bills to return Bills list
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({
        bills,
        get: jest.fn().mockResolvedValue(bills),
      });

      // Create user interface
      const html = `<div id="root"></div>`;
      document.body.innerHTML = html;

      // Execute Router function to active icon
      Router();

      // Check if bill icon is highlighted
      const billIconId = screen.getByTestId("icon-window");
      expect(billIconId.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // Create bills list interface
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      // Get dates list from Html
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Filter date list by date from earliest to latest
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // check if date list form Html is sorted from earliest to latest by comparing date from html with date sorted by code test
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I am on Bills Page and I click on add new bill", () => {
    test("Then add new bill page should open ", () => {
      // Create bills list interface
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      // Init Bills class
      const billPage = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Check if Logout function is called to initialized Logout listener
      expect(Logout).toHaveBeenCalled();

      // Mock handleClickNewBill function
      const handleNewBill = jest.fn((e) => billPage.handleClickNewBill(e));

      // Init event listener
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleNewBill);
      // Mock click by user on new Bill button
      userEvent.click(buttonNewBill);
      // Check if handleClickNewBill function is called
      expect(handleNewBill).toHaveBeenCalled();
    });
  });

  describe("When I am on Bills Page and I click on eye icon", () => {
    test("A modal should open", () => {
      // Create bills list interface
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      // Init Bills class
      const billPage = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Mock modal behaviour
      $.fn.modal = jest.fn();

      // Mock handleClickIconEye function
      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() =>
        billPage.handleClickIconEye(eye)
      );

      // Init event listener
      eye.addEventListener("click", handleClickIconEye);
      // Mock click by user on eye button
      userEvent.click(eye);
      // Check if handleClickNewBill function is called
      expect(handleClickIconEye).toHaveBeenCalled();

      // Check if modal is opened and text is displayed
      const eyeModal = screen.getByTestId("modaleFile");
      const eyeModalText = screen.getAllByText("Justificatif");
      expect(eyeModal).toBeTruthy();
      expect(eyeModalText).toBeTruthy();
    });
  });

  // test d'intégration GET
  describe("When I navigate on Bills Page", () => {
    test("fetches bills user from mock API GET", async () => {
      // Mock and spy get bills
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      const userMail = "a@a";
      const userBills = bills.data.filter((data) => data.email === userMail);

      // check if get Bills is called
      expect(getSpy).toHaveBeenCalledTimes(1);

      // check if bills list length is correct
      expect(userBills.length).toBe(4);
    });

    test("fetches bills user from an API and fails with 404 message error", async () => {
      // create error return
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      // Create bills list interface with error
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      // check if message returning is "Erreur 404"
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      // create error return
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      // Create bills list interface with error
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      // check if message returning is "Erreur 500"
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
