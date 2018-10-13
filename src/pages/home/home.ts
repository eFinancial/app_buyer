import { Component } from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {InvoiceData, LocalInvoiceData} from "../../model/store-data.model";
import {BarcodeScanner} from "@ionic-native/barcode-scanner";
import { Storage } from '@ionic/storage';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  invoiceHistory: LocalInvoiceData[] = [];
  private efiURL = "https://efi-fallback.herokuapp.com/tam/efi/save"
  /* {"hash":"afee217000","invoice":{"date":"2018-10-13T14:01:48.754Z","billNo":1,"totalCostBrutto":26,"totalCostNetto":21.06,"customerPaid":30,"tax":10,"seller":{"name":"döner","ustIdNr":"DE1010101100","address":{"street":"Ortenauerstarße 14","zip":"77653","city":"Offenburg"},"storeID":"1AHH","checkoutLane":3},"products":[{"name":"Avocado","count":5,"itemPrice":5},{"name":"Erdnuss","count":20,"itemPrice":0.05},{"name":"Radio","count":1,"itemPrice":20}]}}*/

  constructor(public navCtrl: NavController,
              private barcodeScanner: BarcodeScanner,
              private storage: Storage,
              private toastCtrl: ToastController,
              private http: HttpClient){
    this.scanQrCode();
  }

  scanQrCode(){
    this.initStorage().then((invoiceHistory: LocalInvoiceData[]) => {
      if(invoiceHistory) {
        this.invoiceHistory = invoiceHistory;
      }
      return this.barcodeScanner.scan({
        resultDisplayDuration: 0,
        prompt: ''
      })
    }).then(qrData => {
      let newInvoice: LocalInvoiceData = {
        invoiceData: JSON.parse(qrData.text),
        verified: false
      };
      const copyOfExistingInvoices = this.invoiceHistory;
      this.invoiceHistory.unshift(newInvoice);
      this.http.post(this.efiURL, JSON.parse(qrData.text))
        .subscribe(() => {
          this.invoiceHistory = copyOfExistingInvoices;
          newInvoice.verified = true;
          this.invoiceHistory.unshift(newInvoice);
          if (this.invoiceHistory.length > 7) {
            this.invoiceHistory.pop();
          }
          this.saveNewHistory();
        });
    }).catch(err => {
      console.log('Error', err);
    });
  }

  getDate(invoice: InvoiceData) {
    let date = new Date(invoice.invoice.date);
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    const year = String(date.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return day + "." + month + "." + year;
  }

  getTime(invoice: InvoiceData) {
    let date = new Date(invoice.invoice.date);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  rescanQR() {
    this.scanQrCode();
  }

  private initStorage() {
    return this.storage.get("invoiceHistory");
  }

  private saveNewHistory() {
    this.storage.set("invoiceHistory", this.invoiceHistory);
  }

  private getMockInvoice() {
    return {
      hash: "afee217000",
      invoice: {
        date: new Date().toISOString(),
        billNo: 1,
        totalCostBrutto: 26,
        totalCostNetto: 26 - 26*0.19,
        customerPaid: 30,
        tax: 10,
        seller: {
          name: "Aldi",
          ustIdNr: "DE1010101100",
          address: {
            street: "Ortenauerstarße 14",
            zip: "77653",
            city: "Offenburg"
          },
          storeID: "1AHH",
          checkoutLane: 3
        },
        products: [
          {
            name: "Avocado",
            count: 5,
            itemPrice: 5.00
          },
          {
            name: "Erdnuss",
            count: 20,
            itemPrice: 0.05
          },
          {
            name: "Radio",
            count: 1,
            itemPrice: 20.00
          }
        ]
      }
    };
  }

  displayNotVerifiedToast() {
    let toast = this.toastCtrl.create({
      message: 'Diese Quittung konnte nicht verfiziert werden.',
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  displayVerifiedToast() {
    let toast = this.toastCtrl.create({
      message: 'Quittung wurde erfolgreich verifiziert',
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}
