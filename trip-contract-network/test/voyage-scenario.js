/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const {
    BusinessNetworkDefinition,
    CertificateUtil,
    IdCard
} = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

describe('Customer | Operator | Driver | Vehicle Owner | Entrepreneur in a voyage', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({
        type: 'composer-wallet-inmemory'
    });

    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    // Name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // Admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for Alice and Bob.
    const customerCardName = 'Customer2137';
    const operatorCardName = 'Operator2138';
    const driverCardName = 'Driver2139';
    const vehicleOwnerCardName = 'Vehicle2140';
    const entrepreneurCardName = 'Owner2141';

    const COST_PER_DISTANCE_UNIT = 5000;
    const COST_PER_PERSON = 100000;
    const MAX_CAPACITY_PERSON = 9;
    const DISTANCE_IN_KM = 90;
    const DRIVING_MINUTES = 105;
    const DRIVER_RATE = 0.3;
    const OPERATOR_RATE = 0.05;
    const SYSTEM_RATE = 0.1;

    // These are a list of receieved events.
    let events;

    let businessNetworkName;

    before(async () => {
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({
            commonName: 'admin'
        });

        // Identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: ['PeerAdmin', 'ChannelAdmin']
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);
        const deployerCardName = 'PeerAdmin';

        adminConnection = new AdminConnection({
            cardStore: cardStore
        });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     */
    async function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        await adminConnection.importCard(cardName, card);
    }

    /**
     *
     * @param {String} voyageOrderId The voyageOrderId to create
     * @param {String} customerId The identity of customer
     * @param {Integer} numberOfTickets The tickets of customer
     */
    async function customerBookVoyage(voyageOrderId, customerId, numberOfTickets) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'BookVoyage');
        transaction.voyageOrderId = voyageOrderId;
        transaction.customer = factory.newRelationship('org.tripcontract.network', 'Customer', customerId);
        transaction.voyage = factory.newRelationship('org.tripcontract.network', 'Voyage', voyageOrderId);
        let voyageDetails = factory.newConcept('org.tripcontract.network', 'VoyageDetails');
        voyageDetails.pickupAddress = '203 hai Ba Trung, Hanoi';
        voyageDetails.dropOffAddress = '167 Tran Hung dao, Da Nang';
        voyageDetails.depatureTime = new Date('2018-04-05T20:00:00.000Z');
        voyageDetails.numberOfTickets = numberOfTickets || 1;
        transaction.voyageDetails = voyageDetails;
        let voyageOptions = factory.newConcept('org.tripcontract.network', 'VoyageOptions');
        voyageOptions.handbag = false;
        voyageOptions.baggage = false;
        voyageOptions.children = false;
        voyageOptions.extras = [];

        transaction.voyageOptions = voyageOptions;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageOrderId The voyageOrderId to update
     * @param {String} seatCode The seatCode to update
     */
    async function customerUpdateVoyageOrder(voyageOrderId, seatCode) {
        // Submit the transaction.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.VoyageOrder');
        const voyageOrder = await assetRegistry.get(voyageOrderId, seatCode);

        let passengerSeat = factory.newConcept('org.tripcontract.network', 'PassengerSeat');
        passengerSeat.seatName = 'W01A';
        passengerSeat.seatCode = seatCode;
        passengerSeat.passengerName = 'NGUYEN VAN B';
        passengerSeat.passengerAge = 30;
        passengerSeat.passengerID = '0123456789';
        if (!voyageOrder.voyageDetails.passengerSeats) {
            voyageOrder.voyageDetails.passengerSeats = [];
        }
        voyageOrder.voyageDetails.passengerSeats.push(passengerSeat);
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageOrder');
        transaction.voyageOrder = factory.newRelationship('org.tripcontract.network', 'VoyageOrder', voyageOrderId);
        transaction.voyageDetails = voyageOrder.voyageDetails;
        transaction.voyageOptions = voyageOrder.voyageOptions;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} driverId The driverId to update
     * @param {String} voyageOrderId The voyageOrderId to update
     * @param {String} voyageOrderStatus The voyageOrderStatus to update
     */
    async function driverCheckInOutVoyageOrder(driverId, voyageOrderId, voyageOrderStatus) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'CheckInCheckOutVoyageOrder');
        transaction.voyageOrder = factory.newRelationship('org.tripcontract.network', 'VoyageOrder', voyageOrderId);
        transaction.driver = factory.newRelationship('org.tripcontract.network', 'Driver', driverId);
        transaction.voyageOrderStatus = voyageOrderStatus;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} personalId The personalId to update
     * @param {String} personalType The personalType to update
     * @param {Double} balanceAmount The balanceAmount to update
     * @param {Double} balanceCredit The balanceCredit to update
     */
    async function changePersonalAmount(personalId, personalType, balanceAmount, balanceCredit) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateAccount');
        const person = factory.newRelationship('org.tripcontract.network', personalType, personalId);
        if (personalType === 'Customer') {
            transaction.customer = person;
        } else if (personalType === 'Operator') {
            transaction.operator = person;
        } else if (personalType === 'Driver') {
            transaction.driver = person;
        } else if (personalType === 'Owner') {
            transaction.owner = person;
        }
        transaction.personalType = personalType;
        transaction.balanceAmount = balanceAmount;
        transaction.balanceCredit = balanceCredit;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageOrderId The voyageOrderId to update
     * @param {String} voyageOrderStatus The voyageOrderStatus to update
     */
    async function customerUpdateVoyageOrderStatus(voyageOrderId, voyageOrderStatus) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageOrderStatus');
        transaction.voyageOrder = factory.newRelationship('org.tripcontract.network', 'VoyageOrder', voyageOrderId);
        transaction.voyageOrderStatus = voyageOrderStatus;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageOrderId The voyageOrderId to update
     * @param {String} voyageOrderStatus The voyageOrderStatus to update
     * @param {String} operatorId The operatorId to update
     */
    async function operatorUpdateVoyageOrderStatus(voyageOrderId, voyageOrderStatus, operatorId) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageOrderStatus');
        transaction.voyageOrder = factory.newRelationship('org.tripcontract.network', 'VoyageOrder', voyageOrderId);
        transaction.voyageOrderStatus = voyageOrderStatus;
        transaction.operator = factory.newRelationship('org.tripcontract.network', 'Operator', operatorId);
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to create
     * @param {String} operatorId The identity of customer
     */
    async function operatorOfferVoyage(voyageId, operatorId) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'OfferVoyage');
        transaction.voyageId = voyageId;
        transaction.voyageName = 'Hanoi - Da Nang';
        transaction.voyageDesc = 'Tuyen xe chat luong cao HN - DN';
        transaction.costPerPerson = COST_PER_PERSON;
        transaction.operator = factory.newRelationship('org.tripcontract.network', 'Operator', operatorId);

        let stationStopHN = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopHN.stationId = 'HN-01';
        stationStopHN.stationAddress = '105 Giai Phong, Hanoi';
        stationStopHN.stationName = 'Station 01 - HN';
        stationStopHN.arrivalTime = new Date();
        stationStopHN.depatureTime = new Date();
        stationStopHN.stopStatus = 'RESERVED';

        let stationStopDN = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopDN.stationId = 'DN-01';
        stationStopDN.stationAddress = '105 Giai Phong, Hanoi';
        stationStopDN.stationName = 'Station 01 - DN';
        stationStopDN.arrivalTime = new Date();
        stationStopDN.depatureTime = new Date();
        stationStopDN.stopStatus = 'RESERVED';

        transaction.stationStops = [stationStopHN, stationStopDN];

        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to update
     * @param {String} voyageName The voyageName to update
     * @param {String} voyageDesc The voyageDesc to update
     * @param {Object} stationStops The list of stops
     */
    async function operatorUpdateVoyage(voyageId, voyageName, voyageDesc, stationStops) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyage');
        transaction.voyage = factory.newRelationship('org.tripcontract.network', 'Voyage', voyageId);
        transaction.stationStops = stationStops;
        transaction.voyageName = voyageName;
        transaction.voyageDesc = voyageDesc;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to update
     * @param {String} vehicleId The vehicleId to assign
     */
    async function operatorAssignVehicle(voyageId, vehicleId) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageStatus');
        transaction.voyage = factory.newRelationship('org.tripcontract.network', 'Voyage', voyageId);
        transaction.voyageStatus = 'VIN_ASSIGNED';
        transaction.vehicle = factory.newRelationship('org.tripcontract.network', 'Vehicle', vehicleId);
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to update
     * @param {String} driverId The driverId to assign
     */
    async function operatorAssignDriver(voyageId, driverId) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageStatus');
        transaction.voyage = factory.newRelationship('org.tripcontract.network', 'Voyage', voyageId);
        transaction.voyageStatus = 'DRV_ASSIGNED';
        transaction.driver = factory.newRelationship('org.tripcontract.network', 'Driver', driverId);
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to update
     * @param {String} voyageStatus The voyageStatus to update
     */
    async function operatorUpdateVoyagaStatus(voyageId, voyageStatus) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'UpdateVoyageStatus');
        transaction.voyage = factory.newRelationship('org.tripcontract.network', 'Voyage', voyageId);
        transaction.voyageStatus = voyageStatus;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    /**
     *
     * @param {String} voyageId The voyageId to create
     * @param {String} operatorId The identity of customer
     * @return {Object} The voyage object
     */
    async function createVoyage(voyageId, operatorId) {
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Voyage');
        // Create the assets.
        const voyage = factory.newResource('org.tripcontract.network', 'Voyage', voyageId);
        voyage.voyageName = 'Hanoi - Da Nang';
        voyage.voyageDesc = 'Tuyen xe chat luong cao HN - DN';
        voyage.costPerPerson = COST_PER_PERSON;
        voyage.estimatedDistance = DISTANCE_IN_KM;
        voyage.estimatedMinutes = DRIVING_MINUTES;
        voyage.operator = factory.newRelationship('org.tripcontract.network', 'Operator', operatorId);
        voyage.voyageStatus = 'CREATED';

        let stationStopHN = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopHN.stationId = 'HN-01';
        stationStopHN.stationAddress = '105 Giai Phong, Hanoi';
        stationStopHN.stationName = 'Station 01 - HN';
        stationStopHN.arrivalTime = new Date('2018-04-05T16:01:55.426Z');
        stationStopHN.depatureTime = new Date('2018-04-05T16:01:55.426Z');
        stationStopHN.stopStatus = 'RESERVED';

        let stationStopDN = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopDN.stationId = 'DN-01';
        stationStopDN.stationAddress = '105 Giai Phong, Hanoi';
        stationStopDN.stationName = 'Station 01 - DN';
        stationStopDN.arrivalTime = new Date('2018-04-05T20:01:55.426Z');
        stationStopDN.depatureTime = new Date('2018-04-05T20:01:55.426Z');
        stationStopDN.stopStatus = 'RESERVED';

        voyage.stationStops = [stationStopHN, stationStopDN];

        assetRegistry.add(voyage);

        return voyage;
    }

    /**
     *
     * @param {String} vehicleId The vehicleId to create
     * @param {String} vehicleStatus The vehicleStatus to create
     * @param {String} ownerId The ownerId to create
     */
    async function createVehicle(vehicleId, vehicleStatus, ownerId) {
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Vehicle');
        const vehicle = factory.newResource('org.tripcontract.network', 'Vehicle', vehicleId);
        vehicle.vehicleStatus = vehicleStatus;

        let vehicleDetails = factory.newConcept('org.tripcontract.network', 'VehicleDetails');
        vehicleDetails.modelType = 'C250';
        vehicleDetails.manufacture = 'Mercedes';
        vehicleDetails.plateNumber = '29A - 668.87';
        vehicleDetails.surfaceColour = 'red';
        vehicleDetails.cabinSeats = [];
        for (let i = 1; i <= MAX_CAPACITY_PERSON; i++) {
            let cabinSeat001 = factory.newConcept('org.tripcontract.network', 'CabinSeat');
            cabinSeat001.seatName = 'W0' + i + 'A';
            cabinSeat001.seatCode = '000' + i;
            cabinSeat001.seatStatus = 'VACANT';
            vehicleDetails.cabinSeats.push(cabinSeat001);
        }
        vehicle.vehicleDetails = vehicleDetails;
        vehicle.costPerDistanceUnit = COST_PER_DISTANCE_UNIT;
        vehicle.maxCapacityPersons = MAX_CAPACITY_PERSON;
        vehicle.owner = factory.newRelationship('org.tripcontract.network', 'Owner', ownerId);
        await assetRegistry.add(vehicle);
    }

    /**
     *
     * @param {String} personalType The personalType to create
     * @param {String} personalId The accountId to create
     * @param {String} screenName The screenName to create
     */
    async function createUser(personalType, personalId, screenName) {
        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'CreateUser');
        transaction.personalType = personalType;
        transaction.personalId = personalId;
        transaction.screenName = screenName;
        transaction.phoneNumber = '0912000000';
        transaction.occupation = 'Blockchain Engineer';
        transaction.registration = 'DPL-HN02';
        transaction.drivingLicense = '000000000000';
        if (personalType === 'Operator') {
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry('org.tripcontract.network.Enterprise');
            let enterprise = factory.newResource('org.tripcontract.network', 'Enterprise', '0');
            enterprise.companyName = 'A Travel CO LTD.,';
            enterprise.operatorRate = OPERATOR_RATE;
            enterprise.driverRate = DRIVER_RATE;
            enterprise.systemRate = SYSTEM_RATE;
            enterprise.parkingRate = 0;
            enterprise.entrepreneur = factory.newRelationship('org.tripcontract.network', 'Owner', '2141');
            enterprise.systemOwner = factory.newRelationship('org.tripcontract.network', 'Owner', '0');
            await participantRegistry.add(enterprise);
            transaction.enterprise = factory.newRelationship('org.tripcontract.network', 'Enterprise', enterprise.getIdentifier());
        }
        await businessNetworkConnection.submitTransaction(transaction);
    }
    /**
     *
     * @param {String} personalType The personalType to check
     * @param {String} personalId The personalId to check
     * @param {Double} expectedBalanceAmount The expectedBalanceAmount to check
     * @param {Double} expectedBalanceCredit The expectedBalanceCredit to check
     */
    async function checkAccountBalance(personalType, personalId, expectedBalanceAmount, expectedBalanceCredit) {
        let participantRegistry = await businessNetworkConnection.getParticipantRegistry('org.tripcontract.network.' + personalType);
        let person = await participantRegistry.get(personalId);
        let assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Account');
        let account = await assetRegistry.get(person.account.getIdentifier());
        account.balanceAmount.toFixed(2).should.equal(expectedBalanceAmount.toFixed(2), 'balanceAmount ' + personalType + '#' + personalId);
        account.balanceCredit.toFixed(2).should.equal(expectedBalanceCredit.toFixed(2), 'balanceCredit ' + personalType + '#' + personalId);
    }

    /**
     *
     * @param {String} personalId The personalId to create
     * @param {String} screenName The screenName to create
     */
    async function createCustomer(personalId, screenName) {
        await createUser('Customer', personalId, screenName);
    }

    /**
     *
     * @param {String} personalId The personalId to create
     * @param {String} screenName The screenName to create
     */
    async function createOperator(personalId, screenName) {
        await createUser('Operator', personalId, screenName);
    }

    /**
     *
     * @param {String} personalId The personalId to create
     * @param {String} screenName The screenName to create
     */
    async function createDriver(personalId, screenName) {
        await createUser('Driver', personalId, screenName);
    }

    /**
     *
     * @param {String} personalId The personalId to create
     * @param {String} screenName The screenName to create
     */
    async function createOwner(personalId, screenName) {
        await createUser('Owner', personalId, screenName);
    }

    // This is called before each test is executed.
    beforeEach(async () => {
        // Generate a business network definition from the project directory.
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
        businessNetworkName = businessNetworkDefinition.getName();
        await adminConnection.install(businessNetworkDefinition);
        const startOptions = {
            networkAdmins: [{
                userName: 'admin',
                enrollmentSecret: 'adminpw'
            }]
        };
        const adminCards = await adminConnection.start(businessNetworkName, businessNetworkDefinition.getVersion(), startOptions);
        await adminConnection.importCard(adminCardName, adminCards.get('admin'));

        // Create and establish a business network connection
        businessNetworkConnection = new BusinessNetworkConnection({
            cardStore: cardStore
        });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);
        // Get the factory for the business network.
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        await createCustomer('2137', 'NGUYEN VAN A');
        await createOperator('2138', 'TRAN VAN B');
        await createDriver('2139', 'HOANG ANH C');
        await createOwner('2140', 'HOANG ANH C');
        await createOwner('2141', 'TRAN VAN B');
        await createOwner('0', 'SYSTEM OWNER');
        await createVoyage('1', '2138');
        await createVoyage('2', '2138');

        // Issue the identities.
        const identityCustomer = await businessNetworkConnection.issueIdentity('org.tripcontract.network.Customer#2137', 'Customer2137');
        await importCardForIdentity(customerCardName, identityCustomer);
        const identityOperator = await businessNetworkConnection.issueIdentity('org.tripcontract.network.Operator#2138', 'Operator2138');
        await importCardForIdentity(operatorCardName, identityOperator);
        const identityDriver = await businessNetworkConnection.issueIdentity('org.tripcontract.network.Driver#2139', 'Driver2139');
        await importCardForIdentity(driverCardName, identityDriver);
        const identityVehicle = await businessNetworkConnection.issueIdentity('org.tripcontract.network.Owner#2140', 'Vehicle2140');
        await importCardForIdentity(vehicleOwnerCardName, identityVehicle);
        const identityOwner = await businessNetworkConnection.issueIdentity('org.tripcontract.network.Owner#2141', 'Owner2141');
        await importCardForIdentity(entrepreneurCardName, identityOwner);
    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The name of the card for the identity to use
     */
    async function useIdentity(cardName) {
        await businessNetworkConnection.disconnect();
        businessNetworkConnection = new BusinessNetworkConnection({
            cardStore: cardStore
        });
        events = [];
        businessNetworkConnection.on('event', (event) => {
            events.push(event);
        });
        await businessNetworkConnection.connect(cardName);
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    }

    it('Operator2138 OFFER a voyage transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorOfferVoyage('3', '2138');

        // Get the Voyage asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Voyage');
        const voyage1 = await assetRegistry.get('3');

        // Validate the asset.
        voyage1.operator.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Operator#2138');
        voyage1.voyageStatus.should.equal('CREATED');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyageId.should.be.a('string');
        event.operator.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Operator#2138');
        event.voyageId.should.equal('3');
    });

    it('Operator2138 VIEW his/her voyages asset', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Voyage');
        const voyages = await assetRegistry.getAll();
        // Validate the assets.
        voyages.length.should.equal(2);
        const voyage = voyages[0];
        voyage.operator.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Operator#2138');
        voyage.voyageStatus.should.equal('CREATED');
    });

    it('Operator2138 UPDATE a voyage transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);

        let stationStopHN = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopHN.stationId = 'HN-01';
        stationStopHN.stationAddress = '105 Giai Phong, Hanoi';
        stationStopHN.stationName = 'Station 01 - HN';
        stationStopHN.arrivalTime = new Date('2018-04-05T16:01:55.426Z');
        stationStopHN.depatureTime = new Date('2018-04-05T16:01:55.426Z');
        stationStopHN.stopStatus = 'RESERVED';

        let stationStopNB = factory.newConcept('org.tripcontract.network', 'StationStop');
        stationStopNB.stationId = 'NB-01';
        stationStopNB.stationAddress = '10 Quoc Lo 1A, Ninh Binh';
        stationStopNB.stationName = 'Station 01 - NB';
        stationStopNB.arrivalTime = new Date('2018-04-05T20:01:55.426Z');
        stationStopNB.depatureTime = new Date('2018-04-05T20:01:55.426Z');
        stationStopNB.stopStatus = 'RESERVED';

        await operatorUpdateVoyage('1', 'HN - NB', 'Hanoi - Ninh Binh', [stationStopHN, stationStopNB]);

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        event.voyage.voyageId.should.equal('1');
        event.voyage.voyageName.should.equal('HN - NB');
        event.voyage.voyageDesc.should.equal('Hanoi - Ninh Binh');
    });

    it('Operator2138 ASSIGN vehicle for a voyage transaction', async () => {
        // Use the identity for Owner.
        await useIdentity(vehicleOwnerCardName);
        await createVehicle('1', 'AVAILABLE', '2140');
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorAssignVehicle('1', '1');
        // Get the Voyage asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Voyage');
        const voyage = await assetRegistry.get('1');

        // Validate the asset.
        voyage.vehicle.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Vehicle#1');
        voyage.voyageStatus.should.equal('VIN_ASSIGNED');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        event.vehicle.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Vehicle#1');
        event.voyageStatus.should.equal('VIN_ASSIGNED');
    });

    it('Operator2138 ASSIGN driver for a voyage transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await createDriver('1', 'NGUYEN VAN A');
        await operatorAssignDriver('1', '1');

        // Get the Voyage asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Voyage');
        const voyage = await assetRegistry.get('1');

        // Validate the asset.
        voyage.driver.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Driver#1');
        voyage.voyageStatus.should.equal('DRV_ASSIGNED');

        // Validate the events:
        events.should.have.lengthOf(2);
        const userEvent = events[0];
        userEvent.driver.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Driver#1');
        userEvent.personalType.should.equal('Driver');

        const updateEvent = events[1];
        updateEvent.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        updateEvent.driver.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Driver#1');
        updateEvent.voyageStatus.should.equal('DRV_ASSIGNED');
    });

    it('Operator2138 ACTIVATED a trip for voyageOrdering transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyagaStatus('1', 'ACTIVATED');
        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        event.voyageStatus.should.equal('ACTIVATED');
    });

    it('Customer2137 CASH-IN wallet w/ balance transaction', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        // Get the Customer asset.
        await changePersonalAmount('2137', 'Customer', 10.0, 0.0);
        let participantRegistry = await businessNetworkConnection.getParticipantRegistry('org.tripcontract.network.Customer');
        let person = await participantRegistry.get('2137');
        let assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Account');
        let account = await assetRegistry.get(person.account.getIdentifier());
        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.personalId.should.be.a('string');
        event.totalBalanceAmount.should.equal(account.balanceAmount);
        event.totalBalanceCredit.should.equal(account.balanceCredit);
    });

    it('Customer2137 ORDER a voyage transaction', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        // Get the VoyageOrder asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.VoyageOrder');
        const voyageOrder1 = await assetRegistry.get('1');

        // Validate the asset.
        voyageOrder1.customer.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Customer' + '#2137');
        voyageOrder1.voyageOrderStatus.should.equal('PLACED');

        // Validate the account.
        await checkAccountBalance('Customer', '2137', 500000 - COST_PER_PERSON, COST_PER_PERSON);

        // Validate the events.
        events.should.have.lengthOf(2);
        const event = events[1];
        event.voyageOrderId.should.be.a('string');
        event.customer.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Customer' + '#2137');
        event.voyageOrderId.should.equal('1');
    });

    it('Customer2137 TRY to ORDER /w lower limit amount transaction', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 20.0, 0.0);
        await customerBookVoyage('1', '2137').should.be.rejectedWith(/Cannot place any voyageOrder with a low limit balance/);
    });

    it('Customer2137 UPDATE voyageOrder with reservation seats transaction', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        await customerUpdateVoyageOrder('1', '0001');

        // Validate the events.
        events.should.have.lengthOf(3);
        const event = events[2];
        event.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event.voyageDetails.passengerSeats[0].seatName.should.equal('W01A');
    });

    it('Customer2137 CANCEL an voyageOrder transaction', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        await customerUpdateVoyageOrderStatus('1', 'CANCELLED');
        await checkAccountBalance('Customer', '2137', 500000.0, 0.0);

        // Validate the events.
        events.should.have.lengthOf(3);
        const event = events[2];
        event.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event.voyageOrderStatus.should.equal('CANCELLED');
    });

    it('Customer2137 TRY to CONFIRMED an voyageOrder transaction to abuse system', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        await customerUpdateVoyageOrderStatus('1', 'CONFIRMED').should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Operator2138 CONFIRMED an voyageOrder transaction of customers', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyageOrderStatus('1', 'CONFIRMED', '2138');
        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event.operator.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Operator#2138');
        event.voyageOrderStatus.should.equal('CONFIRMED');
    });

    it('Operator2138 REJECTED an voyageOrder transaction that is not valid', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyageOrderStatus('1', 'REJECTED', '2138');
        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event.operator.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Operator#2138');
        event.voyageOrderStatus.should.equal('REJECTED');

        await useIdentity(customerCardName);
        await checkAccountBalance('Customer', '2137', 500000.0, 0.0);
    });

    it('Operator2138 TRY to REJECTED an voyageOrder with different operator', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyageOrderStatus('1', 'REJECTED', '2038').should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Operator2138 STARTED a trip for a voyage transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyagaStatus('1', 'STARTED');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        event.voyageStatus.should.equal('STARTED');
    });

    it('Driver2138 TRY to PICK-UP a passenger of Driver0000', async () => {
        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137');
        await useIdentity(operatorCardName);
        await createDriver('0000', 'NGUYEN VAN A');
        await operatorAssignDriver('1', '0000');
        await useIdentity(driverCardName);
        await driverCheckInOutVoyageOrder('0000', '1', 'CHECKED_IN').should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Driver2139 PICK-UP a passenger for a voyage transaction', async () => {
        await useIdentity(vehicleOwnerCardName);
        await createVehicle('1', 'AVAILABLE', '2140');
        await useIdentity(operatorCardName);
        await operatorAssignDriver('1', '2139');
        await operatorAssignVehicle('1', '1');

        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 500000.0, 0.0);
        await customerBookVoyage('1', '2137', 2);
        await customerUpdateVoyageOrder('1', '0001');
        await customerUpdateVoyageOrder('1', '0002');
        await checkAccountBalance('Customer', '2137', 500000.0 - 2 * COST_PER_PERSON, 2 * COST_PER_PERSON);

        await useIdentity(driverCardName);
        await driverCheckInOutVoyageOrder('2139', '1', 'CHECKED_IN');
        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event.voyageOrderStatus.should.equal('CHECKED_IN');
        // Operator check the free seat for the next sale.
        await useIdentity(operatorCardName);
        let seatCount = 0;
        const vehicleRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Vehicle');
        const vehicle = await vehicleRegistry.get('1');
        vehicle.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Vehicle#1');
        vehicle.vehicleDetails.cabinSeats.forEach(cabinSeat => {
            seatCount = cabinSeat.seatStatus === 'INUSED' ? seatCount + 1 : seatCount;
        });
        seatCount.should.equal(2);
    });

    it('Driver2139 DROP-OFF a passenger for a voyage transaction', async () => {
        // Use the identity for Owner.
        await useIdentity(vehicleOwnerCardName);
        await createVehicle('1', 'AVAILABLE', '2140');

        // Use the identity for Customer.
        await useIdentity(customerCardName);
        await changePersonalAmount('2137', 'Customer', 1500000.0, 0.0);
        await customerBookVoyage('1', '2137', 4);
        let numberOfPassengers = 0;
        for (let i=1; i< 5; i++) {
            await customerUpdateVoyageOrder('1', '000' + i);
            numberOfPassengers++;
        }
        // The same user place another voyageOrder
        await customerBookVoyage('2', '2137', 5);
        for (let i=5; i< 10; i++) {
            await customerUpdateVoyageOrder('2', '000' + i);
            numberOfPassengers++;
        }
        await useIdentity(operatorCardName);
        await operatorAssignDriver('1', '2139');
        await operatorAssignVehicle('1', '1');
        await operatorAssignVehicle('2', '1');

        await useIdentity(driverCardName);
        await driverCheckInOutVoyageOrder('2139', '1', 'CHECKED_OUT');
        await driverCheckInOutVoyageOrder('2139', '2', 'CHECKED_OUT');
        // Validate the events.
        events.should.have.lengthOf(2);
        const event1 = events[0];
        event1.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#1');
        event1.voyageOrderStatus.should.equal('CHECKED_OUT');
        const event2 = events[1];
        event2.voyageOrder.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.VoyageOrder#2');
        event2.voyageOrderStatus.should.equal('CHECKED_OUT');

        await useIdentity(operatorCardName);
        let seatCount = 0;
        const vehicleRegistry = await businessNetworkConnection.getAssetRegistry('org.tripcontract.network.Vehicle');
        const vehicle = await vehicleRegistry.get('1');
        vehicle.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Vehicle#1');
        vehicle.vehicleDetails.cabinSeats.forEach(cabinSeat => {
            seatCount = cabinSeat.seatStatus === 'VACANT' ? seatCount + 1 : seatCount;
        });
        seatCount.should.equal(MAX_CAPACITY_PERSON, 'MAX_CAPACITY_PERSON=9');
        // Check Account Balances after payed for 3 passengers.
        const systemCostPerVoyageOrder = numberOfPassengers * COST_PER_PERSON * SYSTEM_RATE;
        const remainingCostPerVoyageOrder = numberOfPassengers * COST_PER_PERSON - systemCostPerVoyageOrder;
        const customerFee = 1500000.0 - numberOfPassengers * COST_PER_PERSON;
        const operatorFee = OPERATOR_RATE * (remainingCostPerVoyageOrder);
        const driverFee = remainingCostPerVoyageOrder* (DRIVER_RATE * DISTANCE_IN_KM / DRIVING_MINUTES);
        const vehicleFee = numberOfPassengers * (COST_PER_DISTANCE_UNIT * DISTANCE_IN_KM / MAX_CAPACITY_PERSON) * (1 - SYSTEM_RATE);
        const entrepreneurFee = remainingCostPerVoyageOrder - operatorFee - driverFee - vehicleFee;
        await useIdentity(customerCardName);
        await checkAccountBalance('Customer', '2137', customerFee, 0);
        await useIdentity(operatorCardName);
        await checkAccountBalance('Operator', '2138', operatorFee, 0);
        await useIdentity(driverCardName);
        await checkAccountBalance('Driver', '2139', driverFee, 0);
        await useIdentity(vehicleOwnerCardName);
        await checkAccountBalance('Owner', '2140', vehicleFee, 0);
        await useIdentity(entrepreneurCardName);
        await checkAccountBalance('Owner', '2141', entrepreneurFee, 0);
    });

    it('Operator2138 FINISHED a trip for a voyage transaction', async () => {
        // Use the identity for Operator.
        await useIdentity(operatorCardName);
        await operatorUpdateVoyagaStatus('1', 'FINISHED');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.voyage.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Voyage#1');
        event.voyageStatus.should.equal('FINISHED');
    });

    /*
    it('Bob can read all of the assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        const assets = await assetRegistry.getAll();

        // Validate the assets.
        assets.should.have.lengthOf(2);
        const asset1 = assets[0];
        asset1.customer.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Customer' + '#2137');
        asset1.value.should.equal('10');
        const asset2 = assets[1];
        asset2.customer.getFullyQualifiedIdentifier().should.equal('org.tripcontract.network.Customer' + '#2237');
        asset2.value.should.equal('20');
    });

    it('Alice can add assets that she owns', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Create the asset.
        let asset3 = factory.newResource('org.tripcontract.network', assetType, '3');
        asset3.owner = factory.newRelationship('org.tripcontract.network', participantType, 'alice@email.com');
        asset3.value = '30';

        // Add the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.add(asset3);

        // Validate the asset.
        asset3 = await assetRegistry.get('3');
        asset3.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#alice@email.com');
        asset3.value.should.equal('30');
    });

    it('Alice cannot add assets that Bob owns', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Create the asset.
        const asset3 = factory.newResource('org.tripcontract.network', assetType, '3');
        asset3.owner = factory.newRelationship('org.tripcontract.network', participantType, 'bob@email.com');
        asset3.value = '30';

        // Try to add the asset, should fail.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.add(asset3).should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Bob can add assets that he owns', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Create the asset.
        let asset4 = factory.newResource('org.tripcontract.network', assetType, '4');
        asset4.owner = factory.newRelationship('org.tripcontract.network', participantType, 'bob@email.com');
        asset4.value = '40';

        // Add the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.add(asset4);

        // Validate the asset.
        asset4 = await assetRegistry.get('4');
        asset4.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#bob@email.com');
        asset4.value.should.equal('40');
    });

    it('Bob cannot add assets that Alice owns', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Create the asset.
        const asset4 = factory.newResource('org.tripcontract.network', assetType, '4');
        asset4.owner = factory.newRelationship('org.tripcontract.network', participantType, 'alice@email.com');
        asset4.value = '40';

        // Try to add the asset, should fail.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.add(asset4).should.be.rejectedWith(/does not have .* access to resource/);

    });

    it('Alice can update her assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Create the asset.
        let asset1 = factory.newResource('org.tripcontract.network', assetType, '1');
        asset1.owner = factory.newRelationship('org.tripcontract.network', participantType, 'alice@email.com');
        asset1.value = '50';

        // Update the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.update(asset1);

        // Validate the asset.
        asset1 = await assetRegistry.get('1');
        asset1.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#alice@email.com');
        asset1.value.should.equal('50');
    });

    it('Alice cannot update Bob\'s assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Create the asset.
        const asset2 = factory.newResource('org.tripcontract.network', assetType, '2');
        asset2.owner = factory.newRelationship('org.tripcontract.network', participantType, 'bob@email.com');
        asset2.value = '50';

        // Try to update the asset, should fail.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.update(asset2).should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Bob can update his assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Create the asset.
        let asset2 = factory.newResource('org.tripcontract.network', assetType, '2');
        asset2.owner = factory.newRelationship('org.tripcontract.network', participantType, 'bob@email.com');
        asset2.value = '60';

        // Update the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.update(asset2);

        // Validate the asset.
        asset2 = await assetRegistry.get('2');
        asset2.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#bob@email.com');
        asset2.value.should.equal('60');
    });

    it('Bob cannot update Alice\'s assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Create the asset.
        const asset1 = factory.newResource('org.tripcontract.network', assetType, '1');
        asset1.owner = factory.newRelationship('org.tripcontract.network', participantType, 'alice@email.com');
        asset1.value = '60';

        // Update the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.update(asset1).should.be.rejectedWith(/does not have .* access to resource/);

    });

    it('Alice can remove her assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Remove the asset, then test the asset exists.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.remove('1');
        const exists = await assetRegistry.exists('1');
        exists.should.be.false;
    });

    it('Alice cannot remove Bob\'s assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Remove the asset, then test the asset exists.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.remove('2').should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Bob can remove his assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Remove the asset, then test the asset exists.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.remove('2');
        const exists = await assetRegistry.exists('2');
        exists.should.be.false;
    });

    it('Bob cannot remove Alice\'s assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Remove the asset, then test the asset exists.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        assetRegistry.remove('1').should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Alice can submit a transaction for her assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'SampleTransaction');
        transaction.asset = factory.newRelationship('org.tripcontract.network', assetType, '1');
        transaction.newValue = '50';
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        const asset1 = await assetRegistry.get('1');

        // Validate the asset.
        asset1.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#alice@email.com');
        asset1.value.should.equal('50');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.eventId.should.be.a('string');
        event.timestamp.should.be.an.instanceOf(Date);
        event.asset.getFullyQualifiedIdentifier().should.equal('org.acme.sample.SampleAsset#1');
        event.oldValue.should.equal('10');
        event.newValue.should.equal('50');
    });

    it('Alice cannot submit a transaction for Bob\'s assets', async () => {
        // Use the identity for Alice.
        await useIdentity(aliceCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'SampleTransaction');
        transaction.asset = factory.newRelationship('org.tripcontract.network', assetType, '2');
        transaction.newValue = '50';
        businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/does not have .* access to resource/);
    });

    it('Bob can submit a transaction for his assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'SampleTransaction');
        transaction.asset = factory.newRelationship('org.tripcontract.network', assetType, '2');
        transaction.newValue = '60';
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        const asset2 = await assetRegistry.get('2');

        // Validate the asset.
        asset2.owner.getFullyQualifiedIdentifier().should.equal(participantNS + '#bob@email.com');
        asset2.value.should.equal('60');

        // Validate the events.
        events.should.have.lengthOf(1);
        const event = events[0];
        event.eventId.should.be.a('string');
        event.timestamp.should.be.an.instanceOf(Date);
        event.asset.getFullyQualifiedIdentifier().should.equal('org.acme.sample.SampleAsset#2');
        event.oldValue.should.equal('20');
        event.newValue.should.equal('60');
    });

    it('Bob cannot submit a transaction for Alice\'s assets', async () => {
        // Use the identity for Bob.
        await useIdentity(bobCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction('org.tripcontract.network', 'SampleTransaction');
        transaction.asset = factory.newRelationship('org.tripcontract.network', assetType, '1');
        transaction.newValue = '60';
        businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/does not have .* access to resource/);
    });
    */
});