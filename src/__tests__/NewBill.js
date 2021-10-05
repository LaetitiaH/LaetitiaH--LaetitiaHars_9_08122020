import { fireEvent, screen } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import { bills } from "../fixtures/bills";
import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill";
import { setLocalStorage, setLocation } from "../__mocks__/Bills.helper";
import firebase from "../__mocks__/firebase";

// Set Information about Employee in LocalStorage
setLocalStorage("user", "Employee", "a@a");
const onNavigate = () => {
  document.body.innerHTML = ROUTES({});
};
// Initialize constants to use in test code
const firestore = null;
const localStorage = window.localStorage;

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", () => {
      // Set location on NewBill page
      const billsPathname = ROUTES_PATH["NewBill"];
      setLocation(billsPathname);

      // Create user interface
      const html = `<div id="root"></div>`;
      document.body.innerHTML = html;

      // Execute Router function to active icon
      Router();

      // Check if mail icon is highlighted
      const billMailIcon = screen.getByTestId("icon-mail");
      expect(billMailIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  describe("When I add image with correct format", () => {
    test("Then file input name need to be the title of the document", () => {
      // Create newBills interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init NewBill class
      const newBillPage = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Mock handleChangeFile function
      const handleChangeFile = jest.fn((e) => newBillPage.handleChangeFile(e));
      const inputFileBill = screen.getByTestId("file");
      // Init event listener
      inputFileBill.addEventListener("change", handleChangeFile);
      // Mock click by user on file input button
      const nameFile = "testImage.png";
      const file = new File([nameFile], "testImage.png", {
        type: "image/png",
      });
      fireEvent.change(inputFileBill, {
        target: {
          files: [file],
        },
      });
      // Check if handleChangeFile function is called
      expect(handleChangeFile).toHaveBeenCalled();
      // Check if correct text is displayed
      expect(inputFileBill.files[0].name).toBe(nameFile);
    });
  });

  describe("When I submit new Bill with correct image format", () => {
    test("Then I should create new Bill", () => {
      // Create newBills interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init NewBill class
      const newBillPage = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Mock user fill newBill form with data
      const inputTypeBill = screen.getByTestId("expense-type");
      fireEvent.change(inputTypeBill, {
        target: { value: bills[0].type },
      });
      // Check if input value is correct
      expect(inputTypeBill.value).toBe(bills[0].type);

      const inputNameBill = screen.getByTestId("expense-name");
      fireEvent.change(inputNameBill, {
        target: { value: bills[0].name },
      });
      // Check if input value is correct
      expect(inputNameBill.value).toBe(bills[0].name);

      const inputAmountBill = screen.getByTestId("amount");
      fireEvent.change(inputAmountBill, {
        target: { value: bills[0].amount },
      });
      // Check if input value is correct
      expect(parseInt(inputAmountBill.value)).toBe(bills[0].amount);

      const inputDateBill = screen.getByTestId("datepicker");
      fireEvent.change(inputDateBill, {
        target: { value: bills[0].date },
      });
      // Check if input value is correct
      expect(inputDateBill.value).toBe(bills[0].date);

      const inputVatBill = screen.getByTestId("vat");
      fireEvent.change(inputVatBill, {
        target: { value: bills[0].vat },
      });
      // Check if input value is correct
      expect(inputVatBill.value).toBe(bills[0].vat);

      const inputCommentaryBill = screen.getByTestId("commentary");
      fireEvent.change(inputCommentaryBill, {
        target: { value: bills[0].commentary },
      });
      // Check if input value is correct
      expect(inputCommentaryBill.value).toBe(bills[0].commentary);

      // Initialize fileUrl and fileName with correct value
      newBillPage.fileUrl = bills[0].fileUrl;
      newBillPage.fileName = bills[0].fileName;

      // Mock handleChangeFile function
      const handleSubmit = jest.fn((e) => newBillPage.handleSubmit(e));
      const form = screen.getByTestId("form-new-bill");
      // Init event listener
      form.addEventListener("submit", handleSubmit);
      // Mock click by user on submit button
      fireEvent.submit(form);

      // Check if handleSubmit function is called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I add image format with incorrect format ", () => {
    test("Then error message should be displayed", () => {
      // Create newBills interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init NewBill class
      const newBillPage = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Mock handleChangeFile function
      const handleChangeFile = jest.fn((e) => newBillPage.handleChangeFile(e));

      // Init event listener
      const inputFileBill = screen.getByTestId("file");
      inputFileBill.addEventListener("change", handleChangeFile);
      // Mock click by user on file input button
      const fileName = "testImage.pdf";
      const file = new File([fileName], "testImage.pdf", {
        type: "image/pdf",
      });
      fireEvent.change(inputFileBill, {
        target: {
          files: [file],
        },
      });

      // Check if error text is displayed
      expect(
        screen.getByText("Le format du fichier est invalide")
      ).toBeTruthy();
    });
  });

  describe("When I submit new Bill with incorrect image format ", () => {
    test("Then error message should be displayed", () => {
      // Create newBills interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init NewBill class
      const newBillPage = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      // Mock user fill newBill form with data
      const inputTypeBill = screen.getByTestId("expense-type");
      fireEvent.change(inputTypeBill, {
        target: { value: bills[0].type },
      });

      const inputNameBill = screen.getByTestId("expense-name");
      fireEvent.change(inputNameBill, {
        target: { value: bills[0].name },
      });

      const inputAmountBill = screen.getByTestId("amount");
      fireEvent.change(inputAmountBill, {
        target: { value: bills[0].amount },
      });

      const inputDateBill = screen.getByTestId("datepicker");
      fireEvent.change(inputDateBill, {
        target: { value: bills[0].date },
      });

      const inputVatBill = screen.getByTestId("vat");
      fireEvent.change(inputVatBill, {
        target: { value: bills[0].vat },
      });

      const inputCommentaryBill = screen.getByTestId("commentary");
      fireEvent.change(inputCommentaryBill, {
        target: { value: bills[0].commentary },
      });

      // Initialize fileUrl and fileName with incorrect value
      newBillPage.fileUrl = null;
      newBillPage.fileName = "testImage.pdf";

      // Mock handleChangeFile function
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillPage.handleSubmit(e));
      // Init event listener
      form.addEventListener("submit", handleSubmit);
      // Mock click by user on submit button
      fireEvent.submit(form);

      // Check if error text is displayed
      expect(
        screen.getByText("Le format du fichier est invalide")
      ).toBeTruthy();
    });
  });
});

// test d'intégration POST
describe("When I submit new Bill", () => {
  // Create Bill constant to add
  const billToAdd = {
    id: "47qAXb6fIm2zOKkLzMrb",
    vat: "80",
    fileUrl:
      "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    commentAdmin: "ok",
    email: "a@a",
    pct: 20,
  };

  test("Add bill to API POST mocked", async () => {
    // Mock and spy post bills
    const getSpy = jest.spyOn(firebase, "post");

    const addBill = await firebase.post(billToAdd);

    // check if get addBill is called
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(addBill).toBeTruthy();
  });
});
