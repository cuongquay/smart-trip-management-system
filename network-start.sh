#!/bin/sh
CLEAN_UP_COMPOSER=${1:-'YES'}
CREATE_DEMO_NETWORKS=${2:-'NO'}
# create hyperledger fabric and network admin card
if [ "${CLEAN_UP_COMPOSER}" = "YES" ]; then
    echo 'Cleaning up .composer data...'
    composer card delete --card admin@trip-contract-network
    rm -rf hyperledger-fabric-dev-servers/fabric-scripts/hlfv11/composer/data
    rm -rf $HOME/.composer
fi
sh hyperledger-fabric-dev-servers/startFabric.sh
sh hyperledger-fabric-dev-servers/createPeerAdminCard.sh --peer 'peer0.trade.tripcontract.com' --ca 'ca.trade.tripcontract.com' --orderer 'orderer.tripcontract.com'
# create trip-contract-network and business network admin card
cd trip-contract-network && rm -rf cards && mkdir cards && rm -f dist/trip-contract-network.bna && npm install
composer network install -a dist/trip-contract-network.bna -c PeerAdmin@tripcontract
composer network start --option config/options.json --networkName trip-contract-network --networkVersion 0.1.16 --card PeerAdmin@tripcontract --networkAdmin admin --networkAdminEnrollSecret adminpw --file cards/networkadmin.card
composer card import --file cards/networkadmin.card
if [ "${CREATE_DEMO_NETWORKS}" = "YES" ]; then
    # create participants as Customer, Operator, Driver, RoomOwner and ParkingOwner
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Customer", "personalId":"2037", "account": "org.tripcontract.network.Account#0", "phoneNumber":"0912000000", "occupation": "Blockchain Engineer"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Operator", "personalId":"2038", "account": "org.tripcontract.network.Account#1", "phoneNumber":"0912000001", "enterprise": "org.tripcontract.network.Enterprise#1"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Driver", "personalId":"2039", "account": "org.tripcontract.network.Account#2", "phoneNumber":"0912000002", "drivingLicense":"01234567890"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Owner", "personalId":"2040", "account": "org.tripcontract.network.Account#3", "phoneNumber":"0912000003", "registration":"AAAAAAAAAAAA", "screenName": "Room Owner"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Owner", "personalId":"2041", "account": "org.tripcontract.network.Account#4", "phoneNumber":"0912000004", "registration":"AAAAAAAAAAAB", "screenName": "Parking Owner"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Owner", "personalId":"2042", "account": "org.tripcontract.network.Account#5", "phoneNumber":"0912000005", "registration":"AAAAAAAAAAAC", "screenName": "Vehicle Owner"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Owner", "personalId":"2043", "account": "org.tripcontract.network.Account#6", "phoneNumber":"0912000006", "registration":"AAAAAAAAAAAD", "screenName": "Enterprise Owner"}'
    composer participant add -c admin@trip-contract-network -d '{"$class":"org.tripcontract.network.Owner", "personalId":"2044", "account": "org.tripcontract.network.Account#7", "phoneNumber":"0912000007", "registration":"AAAAAAAAAAAE", "screenName": "System Owner"}'
    # issue identity cards for each participant in the network
    composer identity issue -u Customer2037 -a org.tripcontract.network.Customer#2037 -c admin@trip-contract-network -f cards/customer.card
    composer identity issue -u Operator2038 -a org.tripcontract.network.Operator#2038 -c admin@trip-contract-network -f cards/operator.card
    composer identity issue -u Driver2039 -a org.tripcontract.network.Driver#2039 -c admin@trip-contract-network -f cards/driver.card
    composer identity issue -u RoomOwner2040 -a org.tripcontract.network.Owner#2040 -c admin@trip-contract-network -f cards/roomowner.card
    composer identity issue -u PackingOwner2041 -a org.tripcontract.network.Owner#2041 -c admin@trip-contract-network -f cards/parkingowner.card
    composer identity issue -u VehicleOwner2042 -a org.tripcontract.network.Owner#2042 -c admin@trip-contract-network -f cards/vehicleowner.card
    composer identity issue -u EnterpriseOwner2043 -a org.tripcontract.network.Owner#2043 -c admin@trip-contract-network -f cards/enterpriseowner.card
    composer identity issue -u SystemOwner2044 -a org.tripcontract.network.Owner#2044 -c admin@trip-contract-network -f cards/systemowner.card
    if [ "${IMPORT_DEMO_CARDS}" = "YES" ]; then
        # importing cards into business network
        composer card import --file cards/customer.card 
        composer card import --file cards/operator.card 
        composer card import --file cards/driver.card 
        composer card import --file cards/roomowner.card 
        composer card import --file cards/parkingowner.card 
        composer card import --file cards/vehicleowner.card 
        composer card import --file cards/enterpriseowner.card 
        composer card import --file cards/systemowner.card 
        composer network ping -c admin@trip-contract-network
    fi
    # list all the cards in business network
    composer card list -c admin@trip-contract-network
    # list all the identities in business network
    composer identity list -c admin@trip-contract-network
fi