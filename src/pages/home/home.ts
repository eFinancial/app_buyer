import { Component } from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
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

  constructor(public navCtrl: NavController,
              private qrScanner: QRScanner,
              private toastCtrl: ToastController){
  }

  ionViewDidEnter() {
    this.scanQrCode();
  }

  ionViewWillLeave(){
    window.document.querySelector('ion-app').classList.remove('cameraView');
  }

    scanQrCode(){
      this.qrScanner.prepare()
        .then((status: QRScannerStatus) => {
          if (status.authorized) {
            // camera permission was granted

            // start scanning

            this.qrScanner.show();
            window.document.querySelector('ion-app').classList.add('cameraView');

            let scanSub = this.qrScanner.scan().subscribe((text: string) => {

              this.qrScanner.hide(); // hide camera preview
              window.document.querySelector('ion-app').classList.remove('cameraView');
              this.invoiceData = JSON.parse(text);
              scanSub.unsubscribe(); // stop scanning
            });


          } else if (status.denied) {
            const toast = this.toastCtrl.create({
              message: 'camera permission was denied',
              duration: 3000
            });
            toast.present();
            // camera permission was permanently denied
            // you must use QRScanner.openSettings() method to guide the user to the settings page
            // then they can grant the permission from there
          } else {
            const toast = this.toastCtrl.create({
              message: 'You can ask for permission again at a later time.',
              duration: 3000
            });
            toast.present();
            // permission was denied, but not permanently. You can ask for permission again at a later time.
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
    console.log(JSON.stringify(this.invoiceData))
    this.scanQrCode();
  }
}
