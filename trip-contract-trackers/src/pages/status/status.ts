import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';

/**
 * Generated class for the StatusPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {
  car: Object;
  orderId: String;
  stage: Array<String>;
  relativeDate: any;
  config: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http) {
    this.car = navParams.get('car');
    this.stage = [Date.now() + ''];
    this.orderId = navParams.get('orderId');

    this.relativeDate = function(input, start) {
      if (input) {
        input = Date.parse(input);
        var diff = input - start;
        diff = diff / 1000
        diff = Math.round(diff);

        var result = '+' + diff +  ' secs'

        return result;
      }
    };

    let statuses = ['PLACED', 'SCHEDULED_FOR_MANUFACTURE', 'VIN_ASSIGNED', 'OWNER_ASSIGNED', 'DELIVERED'];

    var websocket;

    var openWebSocket = () => {
      var webSocketURL = this.config.restServer.webSocketURL;

      console.log('connecting websocket', webSocketURL);
      websocket = new WebSocket(webSocketURL);

      websocket.onopen = function () {
        console.log('websocket open!');
      };

      websocket.onclose = function() {
        console.log('closed');
        openWebSocket();
      }

      websocket.onmessage = (event) => {
        var status = JSON.parse(event.data);
        if (status.$class === 'org.tripcontract.network.UpdateOrderStatusEvent') {
          let i = statuses.indexOf(status.orderStatus);
          this.stage[i] = this.relativeDate(status.timestamp, this.stage[0]);
        }
      };
    }

    this.loadConfig()
      .then((config) => {
        this.config = config;
        openWebSocket();
      });
  }

  loadConfig(): Promise<any> {
      // Load the config data.
      return this.http.get('/assets/config.json')
      .map((res: Response) => res.json())
      .toPromise();
  }
}
