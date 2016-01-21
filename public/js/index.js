/* Globals */
var MERCHANT_ID = "RCTST0000008099";
var MERCHANT_T  = "";
var CLIENT_ID   = "EEVCG7ZA1SFFC";
var API_URL     = "https://apisandbox.dev.clover.com";
var HEADERS     = { "Authorization" : ""};
/* Globals */

var app = angular.module("CloverInventory", []);

app.service("Inventory", ["$rootScope", "$location",
function($rootScope, $location) {
  var self = this;
  self.inventory = {};
  self.status = { "method": "none", "id": "" } // Last item modified

  self.ghost = {};
  self.base_ghost = {"itemGroup":{"id":""},"modifiedTime":"long","code":"","cost":"long","hidden":false,"unitName":"","priceType":"","alternateName":"","isRevenue":false,"modifierGroups":[{"maxAllowed":"int","minRequired":"int","name":"","alternateName":"","modifierIds":"","id":"","modifiers":[{"price":"long","name":"","modifierGroup":{"id":""},"alternateName":"","id":""}],"items":[{"id":""}],"showByDefault":false}],"tags":[{"printers":[{"id":""}],"name":"","id":"","items":[{"id":""}]}],"taxRates":[{"isDefault":false,"rate":"long","name":"","id":"","items":[{"id":""}]}],"itemStock":{"item":{"id":""},"quantity":0,"stockCount":"long"},"price":"long","name":"","id":"","categories":[{"sortOrder":"int","name":"","id":"","items":[{"id":""}]}],"sku":"","defaultTaxRates":false,"stockCount":"long"};

  self.updateGhost = function(data) {
    self.ghost = data;
    $rootScope.$broadcast("onupdateghost");
  };

  // Redirect user to clover authorization page, if no access_token
  // Bulk of my time spent here.... unable to authorize at this point
  // I also attempted to use the access_token provided by the merchant API page
  // See notes in /routes.js

  //$(document).ready(function() {
    //if(window.location.hash) {
      //MERCHANT_T = window.location.hash.substring(13);
      //HEADERS.Authorization = "Bearer " + MERCHANT_T;
    //} else {
      // Page redirects to a page, "not found"
      //window.location.replace(
       //"https://sandbox.dev.clover.com/oauth/authorize?client_id=" + CLIENT_ID +
       //"&response_type=token"
      //);
    //}
  //});

  self.create = function(data) {
    // Create new item in merchant's inventory
    // Endpoint is located at
    // POST     /v3/merchants/{mId}/items
    //$.ajax({
      //method: "POST",
      //url: [API_URL, "/v3/merchants/", MERCHANT_ID, "/items"].join(""),
      //data: { body: data },
      //headers: HEADERS
    //}).then(
      //function success(res) {
        //// Broadcast oninitialize
        //// TODO: broadcast status with created id
        //self.status = { "method": "CREATE" }; // Last item modified
        //$rootScope.$broadcast("oninitialize");
      //},
      //function error(res) { }
    //);

    // Broadcast oninitialize
    // Unable to create... create random ID for data
    var id = Math.floor(Math.random() * 100);
    self.status = { "method": "CREATE", id: id}; // Last item modified
    self.inventory[id] = data;
    data.id = id;
    $rootScope.$broadcast("oninitialize");
  };

  self.get    = function(id) {
    // Retrieve this item from merchant's inventory
    // If no id is specified, retrieves all items
    // Endpoint is located at
    // GET     /v3/merchants/{mId}/items
    // GET     /v3/merchants/{mId}/items/{itemId}

    var url    = "http://stardust.red:3000/merchants/items"; // Retrieve dummy data
    //if(id) url = [API_URL, "/v3/merchants/", MERCHANT_ID, "/items/", id].join("");
    //else   url = [API_URL, "/v3/merchants/", MERCHANT_ID, "/items"].join("");

    $.ajax({ method: "GET", url: url }).then(
      function success(res) {
        // Save response into self.inventory
        self.inventory = {};
        for(var i = 0; i < res.results.length; i++) {
          self.inventory[res.results[i].id] = res.results[i];
        }

        // Broadcast oninitialize
        self.status = { "method": "POPULATE" }; // Last item modified
        $rootScope.$broadcast("oninitialize");
      },
      function error(res) { }
    );
  };

  self.update = function(id, data) {
    // Update an item from merchant's inventory
    // Endpoint is located at
    // POST     /v3/merchants/{mId}/items/{itemId}

    //$.ajax({
      //method: "POST",
      //url: [API_URL, "/v3/merchants/", MERCHANT_ID, "/items/", id].join(""),
      //data: { body: data },
      //headers: HEADERS
    //}).then(
      //function success(res) {
        //// Broadcast oninitialize
        //self.status = { "method": "UPDATE", "id": id }; // Last item modified
        //$rootScope.$broadcast("onupdate");
      //},
      //function error(res) { }
    //);

    // Broadcast onupdate
    self.status = { "method": "UPDATE", id: id}; // Last item modified
    self.inventory[id] = data;
    $rootScope.$broadcast("onupdate");
  };

  self.remove = function(id) {
    // Delete item from merchant's inventory
    // if no id is specified.... BULK DELETES
    // DELETE     /v3/merchants/{mId}/items
    // DELETE     /v3/merchants/{mId}/items/{itemId}

    if(id) url = [API_URL, "/v3/merchants/", MERCHANT_ID, "/items/", id].join("");
    else   url = [API_URL, "/v3/merchants/", MERCHANT_ID, "/items"].join("");

    //$.ajax({
      //method: "DELETE",
      //url: url,
      //data: { body: data },
      //headers: HEADERS
    //}).then(
      //function success(res) {
        //if(id) {
          //// Broadcast ondelete
          //self.status = { "method": "DELETE", "id": id }; // Last item modified
          //$rootScope.$broadcast("ondelete");
        //} else {
          //// Broadcast oninitialize
          //self.status = { "method": "POPULATE" }; // Last item modified
          //$rootScope.$broadcast("oninitialize");
        //}
      //},
      //function error(res) { }
    //);

    // Broadcast ondelete
    self.status = { "method": "DELETE", id: id}; // Last item modified
    delete self.inventory[id];
    $rootScope.$broadcast("ondelete");
  };
}]);

app.controller("ListCtrl", ["$rootScope", "$scope", "Inventory",
function($rootScope, $scope, Inventory) {
  // Displays current items in merchant's inventory
  var self = this;
  self.listing   = {}; // Local copy of inventory list
  self.Inventory = Inventory;

  // Initialize list ctrl
  $(document).ready(function() {
    // Retrieve items from merchant
    // On success, populate self.listing
    Inventory.get();
  });

  self.new = function() {
    // Initialize ghost to a new item
    Inventory.updateGhost(Inventory.base_ghost);
    $("#updateModal").modal();
  };

  self.update = function(id) {
    // Initialize ghost to given ID
    Inventory.updateGhost(Inventory.inventory[id]);
    if(Inventory.ghost === undefined) Inventory.updateGhost(Inventory.base_ghost);
    $("#updateModal").modal();
  };

  self.delete = function(id) {
    // Tell inventory to delete this ID
    Inventory.remove(id);
  };

  // Event Listeners
  $scope.$on("oninitialize", function() {
    // Populate self.listing
    self.listing = Inventory.inventory;
    $scope.$apply();
  });

  $scope.$on("ondelete", function() {
    // Respond to Inventory's delete
    // Delete inventory item from listing
    self.listing = Inventory.inventory;
    $scope.$apply();
  });

  $scope.$on("onupdate", function() {
    // Response to Inventory's update
    // Update inventory item
    self.listing = Inventory.inventory;
    $scope.$apply();
  });
}]);

app.controller("UpdateCtrl", ["$scope", "Inventory",
function($scope, Inventory) {
  var self = this;
  self.ghost = Inventory.ghost;

  self.submit = function() {
    // If there is no id, then this is a new item
    if(self.ghost.id === "") { Inventory.create(self.ghost); }
    else      { Inventory.update(self.ghost.id, self.ghost); }
    Inventory.updateGhost(Inventory.base_ghost);
  }

  self.validate = function() {
    // Validate ghost
    // Do arbitrary field validations....
    // Fields are validated hmm hmm yess
    return true;
  };

  $scope.$on("onupdateghost", function() {
    self.ghost = Inventory.ghost;
  });
}]);
