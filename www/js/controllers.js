angular.module('digitalartShop.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
//    $scope.reservation = {};
    $scope.registration = {};
    $scope.loggedIn = false;
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
    
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
      
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    // Create the login modal that we will use later
    //$ionicModal.fromTemplateUrl('templates/reserve.html', {
    //    scope: $scope
    //}).then(function (modal) {
    //    $scope.reserveform = modal;
    //});

    // Triggered in the login modal to close it
    //$scope.closeReserve = function () {
    //    $scope.reserveform.hide();
    //};

    // Open the login modal
    //$scope.reserve = function () {
    //    $scope.reserveform.show();
    //};

    // Perform the login action when the user submits the login form
    //$scope.doReserve = function () {
    //    console.log('Doing reservation', $scope.reservation);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
    //    $timeout(function () {
    //        $scope.closeReserve();
    //    }, 1000);
    //};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthFactory.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
       
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $localStorage.storeObject('userinfo',$scope.loginData);
    });
    
    $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
 
        $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                console.log(err);
            });
            $scope.registerform.show();
        };
        
          var pickoptions = {
              maximumImagesCount: 1,
              width: 100,
              height: 100,
              quality: 50
          };
        
        $scope.pickImage = function() {
          $cordovaImagePicker.getPictures(pickoptions)
              .then(function (results) {
                  for (var i = 0; i < results.length; i++) {
                      console.log('Image URI: ' + results[i]);
                      $scope.registration.imgSrc = results[0];
                  }
              }, function (error) {
                  // error getting photos
              });
        };
 
    });
})

.controller('OnlineshopController', ['$scope', 'onlineshopFactory', 'wishlistFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, onlineshopFactory, wishlistFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;


    onlineshopFactory.query(
        function (response) {
            $scope.artworks = response;
        },
        function (response) {
        });
    
    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "life";
        } else if (setTab === 3) {
            $scope.filtText = "object";
        } else if (setTab === 4) {
            $scope.filtText = "fiction";
		} else if (setTab === 5) {
            $scope.filtText = "pattern";
        } else if (setTab === 6) {
            $scope.filtText = "philosophy";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.addWishlist = function (artworkid) {
        console.log("artworkid is " + artworkid);

        wishlistFactory.save({_id: artworkid});
        $ionicListDelegate.closeOptionButtons();
        
        $ionicPlatform.ready(function () {

                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Wishlist",
                    text: $scope.artworks[artworkid].name
                }).then(function () {
                    console.log('Added Wishlist '+$scope.artworks[artworkid].name);
                },
                function () {
                    console.log('Failed to add Wishlist ');
                });
            
              $cordovaToast
                  .show('Added Wishlist '+$scope.artworks[artworkid].name, 'long', 'center')
                  .then(function (success) {
                      // success
                  }, function (error) {
                      // error
                  });


        });
    }
}])

.controller('ExhibitionController', ['$scope', 'exhibitionFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, exhibitionFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;


    exhibitionFactory.query(
        function (response) {
            $scope.exhibitions = response;
        },
        function (response) {
        });
    
    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "life";
        } else if (setTab === 3) {
            $scope.filtText = "object";
        } else if (setTab === 4) {
            $scope.filtText = "fiction";
		} else if (setTab === 5) {
            $scope.filtText = "pattern";
        } else if (setTab === 6) {
            $scope.filtText = "philosophy";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };
    
}])


.controller('ContactController', ['$scope', '$ionicModal', '$timeout', 'feedbackFactory', function ($scope, $ionicModal, $timeout, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/feedback.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.feedbackform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeFeedback = function () {
        $scope.feedbackform.hide();
    };

    // Open the login modal
    $scope.feedback = function () {
        $scope.feedbackform.show();
    };

    $scope.sendFeedback = function () {

        console.log($scope.feedback);

        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            console.log($scope.feedback);
        }
    };
}])

.controller('ArtworkDetailController', ['$scope', '$state', '$stateParams', 'onlineshopFactory', 'wishlistFactory', 'commentFactory', 'baseURL', '$ionicPopover', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, $state, $stateParams, onlineshopFactory, wishlistFactory, commentFactory, baseURL, $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;

     $scope.artwork = onlineshopFactory.get({
            id: $stateParams.id
        },
            function (response) {
                $scope.artwork = response;
            },
            function (response) {
            }
        );  
        
        console.log($scope.artwork);


    
    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/artwork-detail-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });


    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function () {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
        // Execute action
    });

    $scope.addWishlist = function () {
        console.log("index is " + $stateParams.id);

        wishlistFactory.save({_id: $stateParams.id});;
        $scope.popover.hide();
        
                
        $ionicPlatform.ready(function () {

                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Wishlist",
                    text: $scope.artwork.name
                }).then(function () {
                    console.log('Added Wishlist '+$scope.artwork.name);
                },
                function () {
                    console.log('Failed to add Wishlist ');
                });
            
              $cordovaToast
                  .show('Added Wishlist '+$scope.artwork.name, 'long', 'bottom')
                  .then(function (success) {
                      // success
                  }, function (error) {
                      // error
                  });


        });
        
    };

    $scope.mycomment = {
        rating: 5,
        comment: ""
    };

    $scope.submitComment = function () {

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $scope.closeCommentForm();

        
        $scope.mycomment = {
            rating: 5,
            comment: ""
        };
        
        $state.go($state.current, null, {reload: true});
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/artwork-comment.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.commentForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeCommentForm = function () {
        $scope.commentForm.hide();
    };

    // Open the login modal
    $scope.showCommentForm = function () {
        $scope.commentForm.show();
        $scope.popover.hide();
    };
    
}])


// implement the IndexController and About Controller here

.controller('IndexController', ['$scope', 'onlineshopFactory', 'exhibitionFactory', 'corporateFactory', 'baseURL', function ($scope, onlineshopFactory, exhibitionFactory, corporateFactory, baseURL) {
    
    $scope.baseURL = baseURL;
    corporateFactory.query({
        },
            function (response) {
                var artists = response;
                $scope.artist = artists[0];
                $scope.showArtist = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    onlineshopFactory.query({
        },
            function (response) {
                var artworks = response;
                $scope.artwork = artworks[0];
                $scope.showArtwork = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    exhibitionFactory.query({
        label: "New"
    },
            function (response) {
                var exhibitions = response;
                $scope.exhibition = exhibitions[0];
                $scope.showExhibition = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

}])

.controller('AboutController', ['$scope', 'corporateFactory', 'baseURL', function ($scope, corporateFactory, baseURL) {

    $scope.baseURL = baseURL;
    $scope.artists = corporateFactory.query();

}])

.controller('WishlistController', ['$scope', '$state', 'wishlistFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration', function ($scope, $state, wishlistFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    wishlistFactory.query(
        function (response) {
            $scope.wishlists = response.artworks;
            $scope.showWishlist = true;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    console.log($scope.wishlists);
 

    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteWishlist = function (wishlistid) {

        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                wishlistFactory.delete({id: wishlistid});
         
               $state.go($state.current, {}, {reload: true});
               // $window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;


    }

}])

;