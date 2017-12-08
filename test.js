var FlightDashboard = function( $scope, user, flightService, weatherService )
{
    travelService.getDeparture( user ).then( function( departure )
        {$scope.departure = departure; return travelService.getFlight( departure.flightID );}).then( function( flight )
        {$scope.flight = flight; return weatherService.getForecast( $scope.departure.date );}).then( function( weather )
        {$scope.weather = weather;});

        $scope.flight     = null;
    $scope.planStatus = null;
    $scope.forecast   = null;
};