'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider',
        function($routeProvider) {
  $routeProvider.
        when('/view1',{
        templateUrl: '/view1/view1.html',
        controller: 'mainCtrl'
}).
when('/view2/:Id',{
        templateUrl: 'view2/view2.html',
        controller: 'mainCtrl'
}).
        otherwise({redirectTo: '/view1'});
}]).
controller('mainCtrl', ['$rootScope','$scope','$routeParams', function($scope,$rootScope,$routeParams){

    $scope.coffees =
       [
       {'id': 1,
       'brand': "Average Andy's Coffee",
       'name': 'Regular Coffee',
       'country': 'Denmark',
       'reviews': [
               {'rating': 3,
               'comment': "Could've been crispier",
               'reviewer': "Chris P. Bacon"
               }
       ]
       },
       {'id': 2,
       'brand': "Jimmy's Coffee",
       'name': 'Mocha',
       'country': 'America',
       'reviews': [
       {'rating': 10,
       'comment': 'What everyone should drink in the morning!',
       'reviewer': 'Earl Lee Riser'
       },
       {'rating': 10,
       'comment': 'A genius of everything coffee',
       'reviewer': 'Bob'
       }
       ]
       },
       {'id': 3,
       'brand': "We Did Our Best",
       'name': 'Latte',
       'country': 'France',
       'reviews': [
       {'rating': 1,
       'comment': " a 'latte' yuckiness.",
       'reviewer': 'Tim Burr'
       },
       {'rating': 1,
       'comment': 'Is this even coffee?',
       'reviewer': 'Sue Flay'
       },
        {'rating': 1,
       'comment': 'The grossest thing I have ever had.',
       'reviewer': 'Myles Long'
       },
        {'rating': 5,
       'comment': 'I dont know what the fuss is about, i dont think its too bad!',
       'reviewer': 'Sara Bellum'
       }
       ]
		},
       {'id': 4,
       'brand': "Jimmy's Special Coffee",
       'name': 'Americano',
       'country': 'America',
       'reviews': [
       {'rating': 10,
       'comment': 'If I could rate it higher, I would!',
       'reviewer': 'Justin Case'
       },
       {'rating': 10,
       'comment': 'He does it again!',
       'reviewer': 'Eileen Dover'
       }
       ]
       }];


for(var i = 0; i<$scope.coffees.length; i++){

        if($scope.coffees[i].id == $routeParams.Id){
                $scope.selected = $scope.coffees[i];
        }

}


}]);
