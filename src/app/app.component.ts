import { Component } from '@angular/core';
import { ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;

  //get access to child DOM element
  //The @ViewChild decorator accepts a single string that is the selector to the element or directive.
  @ViewChild("search")
  public searchElementRef: ElementRef;

  //Load dependencies
  constructor(
    private mapsAPILoader: MapsAPILoader, // load google maps places API
    //The NgZone service enables us to perform asynchronous operations outside of the Angular zone, or in our case, to explicitly run a function within the Angular zone. 
    //Angular’s zones patch most of the asynchronous APIs in the browser, invoking change detection when an asynchronous code is completed.
    // As you might expect Angular zones are not patching the asynchronous behavior of Google Place autocomplete.
    private ngZone: NgZone 
  ) {}

  ngOnInit() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition(); //uses geolocation API in the browser

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        // Without the use of the NgZone.run() method the changes to our latitude, longitude and zoom will not be triggered 
        // until change detection is triggered by another event or asynchronous operation.
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
}
