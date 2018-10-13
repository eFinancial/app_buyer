import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {QRScanner, QRScannerStatus} from "@ionic-native/qr-scanner";
import {InvoiceData} from "../../model/store-data.model";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  invoiceData: InvoiceData = {
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

  constructor(public navCtrl: NavController, private qrScanner: QRScanner){
    this.scanQrCode();
  }

  scanQrCode(){
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            this.invoiceData = JSON.parse(text);
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
          });
        } else if (status.denied) {
          console.log("pech gehabt");
        } else {
          console.log("pech gehabt");

        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  getDate() {
    let date = new Date(this.invoiceData.invoice.date);
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    const year = String(date.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return day + "." + month + "." + year;
  }

  getTime() {
    let date = new Date(this.invoiceData.invoice.date);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  rescanQR() {
    console.log(JSON.stringify(this.invoiceData));
    //this.scanQrCode();
  }
}
