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

String.prototype.hashids = function () {
    return this.split('').reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0).toString(16);
};

// CREATE USER FUNCTIONS
/**
 * Create a user according to its type
 * @param {org.tripcontract.network.CreateUser} userRequest - the CreateUser transaction
 * @transaction
 */
async function createUser(userRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    let createUserEvent = factory.newEvent(namespace, 'CreateUserEvent');
    let person = factory.newResource(namespace, userRequest.personalType, userRequest.personalId);
    let accountId = (userRequest.personalType.toLowerCase() + userRequest.personalId).hashids();
    person.phoneNumber = userRequest.phoneNumber;
    person.screenName = userRequest.screenName;
    person.account = factory.newResource(namespace, 'Account', accountId);
    person.account.balanceAmount = 0.0;
    person.account.balanceCredit = 0.0;
    if (userRequest.personalType === 'Customer') {
        person.occupation = userRequest.occupation;
        createUserEvent.customer = person;
    } else if (userRequest.personalType === 'Operator') {
        person.enterprise = userRequest.enterprise;
        createUserEvent.operator = person;
    } else if (userRequest.personalType === 'Driver') {
        person.drivingLicense = userRequest.drivingLicense;
        createUserEvent.driver = person;
    } else if (userRequest.personalType === 'Owner') {
        person.registration = userRequest.registration;
        createUserEvent.owner = person;
    }

    // create new user into participant registry
    let participantRegistry = await getParticipantRegistry(person.getFullyQualifiedType());
    await participantRegistry.add(person);
    let assetRegistry = await getAssetRegistry(person.account.getFullyQualifiedType());
    await assetRegistry.add(person.account);
    createUserEvent.personalType = userRequest.personalType;
    emit(createUserEvent);
}

// UODATE ACCOUNT FUNCTIONS
/**
 * Update account according to its balances
 * @param {org.tripcontract.network.UpdateAccount} updateRequest - the UpdateAccount transaction
 * @transaction
 */
async function updateAccount(updateRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    let updateAccountEvent = factory.newEvent(namespace, 'UpdateAccountEvent');
    let person = null;
    if (updateRequest.personalType === 'Customer') {
        person = updateRequest.customer;
    } else if (updateRequest.personalType === 'Operator') {
        person = updateRequest.operator;
    } else if (updateRequest.personalType === 'Driver') {
        person = updateRequest.driver;
    } else if (updateRequest.personalType === 'Owner') {
        person = updateRequest.owner;
    }
    let assetRegistry = await getAssetRegistry(namespace + '.Account');
    let account = await assetRegistry.get(person.account.getIdentifier());
    account.balanceAmount += updateRequest.balanceAmount;
    account.balanceCredit += updateRequest.balanceCredit;
    await assetRegistry.update(account);
    // emit the change credit event when done
    updateAccountEvent.personalId = person.getIdentifier();
    updateAccountEvent.personalType = updateRequest.personalType;
    updateAccountEvent.totalBalanceAmount = account.balanceAmount;
    updateAccountEvent.totalBalanceCredit = account.balanceCredit;
    emit(updateAccountEvent);
}

// ORDERING FUNCTIONS
/**
 * Customer place an voyageOrder for a vehicle
 * @param {org.tripcontract.network.BookVoyage} voyageOrderRequest - the BookVoyage transaction
 * @transaction
 */
async function bookVoyage(voyageOrderRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';

    let voyageOrder = factory.newResource(namespace, 'VoyageOrder', voyageOrderRequest.voyageOrderId);
    voyageOrder.customer = voyageOrderRequest.customer;
    voyageOrder.voyageDetails = voyageOrderRequest.voyageDetails;
    voyageOrder.voyageOptions = voyageOrderRequest.voyageOptions;
    voyageOrder.voyageOrderStatus = 'PLACED';
    if (voyageOrderRequest.voyage) {
        voyageOrder.voyage = voyageOrderRequest.voyage;
        if (voyageOrder.voyage.costPerPerson > voyageOrder.customer.account.balanceAmount) {
            throw new Error('Cannot place any voyageOrder with a low limit balance. ' +
                'Required: ' + voyageOrder.voyage.costPerPerson + ' ' +
                'Remaining: ' + voyageOrder.customer.account.balanceAmount);
        } else {
            voyageOrder.customer.account.balanceAmount -= voyageOrder.voyage.costPerPerson * voyageOrder.voyageDetails.numberOfTickets;
            voyageOrder.customer.account.balanceCredit += voyageOrder.voyage.costPerPerson * voyageOrder.voyageDetails.numberOfTickets;
            let accountRegistry = await getAssetRegistry(voyageOrder.customer.account.getFullyQualifiedType());
            await accountRegistry.update(voyageOrder.customer.account);
        }
    } else {
        // find and choose some voyages before place an voyageOrder
        let results = await query('queryVoyageHasMaxCostPerPerson', {
            maxCostPerPerson: 20
        }); // eslint-disable-line no-unused-vars
        console.log(results);
        throw new Error('Cannot place any voyageOrder without a voyage');
    }
    console.log('\tVoyageName:\t' + voyageOrder.voyage.voyageName + '\tPrice:\t' + '*' + voyageOrder.voyage.costPerPerson.toFixed(2));
    console.log('\tCost/Km/Mins:\t' + voyageOrder.voyage.costPerPerson.toFixed(2) + '/' + voyageOrder.voyage.estimatedDistance + '/' + voyageOrder.voyage.estimatedMinutes);
    console.log('\tCustomerName:\t' + voyageOrder.customer.screenName + '\tRemain:\t' + voyageOrder.customer.account.balanceAmount.toFixed(2));
    console.log('\t\t\t\t\tCredit:\t' + voyageOrder.customer.account.balanceCredit.toFixed(2));

    // save the voyageOrder into asset registry
    let assetRegistry = await getAssetRegistry(voyageOrder.getFullyQualifiedType());
    await assetRegistry.add(voyageOrder);
    // emit the place voyageOrder event when done
    let bookVoyageEvent = factory.newEvent(namespace, 'BookVoyageEvent');
    bookVoyageEvent.voyageOrderId = voyageOrder.voyageOrderId;
    bookVoyageEvent.voyageDetails = voyageOrder.voyageDetails;
    bookVoyageEvent.voyageOptions = voyageOrder.voyageOptions;
    bookVoyageEvent.customer = voyageOrder.customer;
    bookVoyageEvent.voyage = voyageOrder.voyage;
    emit(bookVoyageEvent);
}

/**
 * Update the status of an voyageOrder
 * @param {org.tripcontract.network.UpdateVoyageOrder} updateVoyageOrderRequest - the UpdateVoyageOrder transaction
 * @transaction
 */
async function updateVoyageOrder(updateVoyageOrderRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    // get voyageOrder registry by namespace
    let voyageOrderRegistry = await getAssetRegistry(namespace + '.VoyageOrder');
    let voyageOrder = updateVoyageOrderRequest.voyageOrder;
    voyageOrder.voyageOptions = updateVoyageOrderRequest.voyageOptions;
    voyageOrder.voyageDetails = updateVoyageOrderRequest.voyageDetails;
    if (voyageOrder.voyage.voyageStatus === 'DRV_ASSIGNED' || voyageOrder.voyage.voyageStatus === 'VIN_ASSIGNED') {
        let seatIntersection = voyageOrder.voyage.vehicle.vehicleDetails.cabinSeats.filter(x => {
            return voyageOrder.voyageDetails.passengerSeats.filter(s => (s.seatCode === x.seatCode)).length ? true : false;
        });
        seatIntersection.forEach(cabinSeat => {
            if (cabinSeat.seatStatus === 'VACANT') {
                cabinSeat.seatStatus = 'OCCUPIED';
            }
        });
        const assetRegistry = await getAssetRegistry('org.tripcontract.network.Vehicle');
        await assetRegistry.update(voyageOrder.voyage.vehicle);
    }
    await voyageOrderRegistry.update(voyageOrder);
    // emit the update voyageOrder event
    let updateVoyageOrderStatusEvent = factory.newEvent(namespace, 'UpdateVoyageOrderEvent');
    updateVoyageOrderStatusEvent.voyageOptions = updateVoyageOrderRequest.voyageOrder.voyageOptions;
    updateVoyageOrderStatusEvent.voyageDetails = updateVoyageOrderRequest.voyageOrder.voyageDetails;
    updateVoyageOrderStatusEvent.voyageOrder = updateVoyageOrderRequest.voyageOrder;
    emit(updateVoyageOrderStatusEvent);
}

/**
 * Update the status of an voyageOrder
 * @param {org.tripcontract.network.UpdateVoyageOrderStatus} updateVoyageOrderRequest - the UpdateVoyageOrderStatus transaction
 * @transaction
 */
async function updateVoyageOrderStatus(updateVoyageOrderRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    // update the voyageOrder in registry
    let voyageOrder = updateVoyageOrderRequest.voyageOrder;
    voyageOrder.voyageOrderStatus = updateVoyageOrderRequest.voyageOrderStatus;
    // get voyageOrder registry by namespace
    let voyageOrderRegistry = await getAssetRegistry(namespace + '.VoyageOrder');
    if (updateVoyageOrderRequest.voyageOrderStatus === 'CANCELLED' || updateVoyageOrderRequest.voyageOrderStatus === 'REJECTED') {
        voyageOrder.customer.account.balanceAmount += voyageOrder.voyage.costPerPerson;
        voyageOrder.customer.account.balanceCredit -= voyageOrder.voyage.costPerPerson;
        let accountRegistry = await getAssetRegistry(voyageOrder.customer.account.getFullyQualifiedType());
        await accountRegistry.update(voyageOrder.customer.account);
    }
    await voyageOrderRegistry.update(voyageOrder);
    console.log('\tVoyageOrderStatus:\t' + voyageOrder.voyageOrderStatus + '\tRemain:\t' + voyageOrder.customer.account.balanceAmount.toFixed(2));
    // emit the update voyageOrder event
    let updateVoyageOrderStatusEvent = factory.newEvent(namespace, 'UpdateVoyageOrderStatusEvent');
    updateVoyageOrderStatusEvent.voyageOrderStatus = updateVoyageOrderRequest.voyageOrderStatus;
    updateVoyageOrderStatusEvent.voyageOrder = updateVoyageOrderRequest.voyageOrder;
    if (updateVoyageOrderRequest.operator) {
        updateVoyageOrderStatusEvent.operator = updateVoyageOrderRequest.operator;
    }
    emit(updateVoyageOrderStatusEvent);
}

/**
 * Driver check-in/out the voyageOrder for customer
 * @param {org.tripcontract.network.CheckInCheckOutVoyageOrder} checkInOutVoyageOrderRequest - the CheckInCheckOutVoyageOrder transaction
 * @transaction
 */
async function checkInCheckOutVoyageOrder(checkInOutVoyageOrderRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    // get voyageOrder registry by namespace
    let voyageOrderRegistry = await getAssetRegistry(namespace + '.VoyageOrder');
    // update the voyageOrder in registry
    let voyageOrder = checkInOutVoyageOrderRequest.voyageOrder;
    let driver = checkInOutVoyageOrderRequest.driver;
    voyageOrder.voyageOrderStatus = checkInOutVoyageOrderRequest.voyageOrderStatus;
    let seatIntersection = voyageOrder.voyage.vehicle.vehicleDetails.cabinSeats.filter(x => {
        return voyageOrder.voyageDetails.passengerSeats.filter(s => (s.seatCode === x.seatCode)).length ? true : false;
    });
    seatIntersection.forEach(cabinSeat => {
        cabinSeat.seatStatus = voyageOrder.voyageOrderStatus === 'CHECKED_OUT' ? 'VACANT' : 'INUSED';
    });
    if (voyageOrder.voyageOrderStatus === 'CHECKED_OUT') {
        const costPerVoyageOrder = voyageOrder.voyageDetails.numberOfTickets * voyageOrder.voyage.costPerPerson;
        const systemFeePerVoyageOrder = costPerVoyageOrder * voyageOrder.voyage.operator.enterprise.systemRate;
        const remainingCostPerVoyageOrder = costPerVoyageOrder - systemFeePerVoyageOrder;
        const vehicleCostPerPerson = voyageOrder.voyage.vehicle.costPerDistanceUnit * voyageOrder.voyage.estimatedDistance / voyageOrder.voyage.vehicle.maxCapacityPersons;
        const driverRate = voyageOrder.voyage.operator.enterprise.driverRate * voyageOrder.voyage.estimatedDistance / voyageOrder.voyage.estimatedMinutes;
        const driverFee = driverRate * remainingCostPerVoyageOrder;
        const operatorFee = voyageOrder.voyage.operator.enterprise.operatorRate * remainingCostPerVoyageOrder;
        const vehicleFee = voyageOrder.voyageDetails.numberOfTickets * vehicleCostPerPerson * (1 - voyageOrder.voyage.operator.enterprise.systemRate);
        voyageOrder.customer.account.balanceCredit -= costPerVoyageOrder;
        driver.account.balanceAmount += driverFee;
        voyageOrder.voyage.operator.account.balanceAmount += operatorFee;
        voyageOrder.voyage.vehicle.owner.account.balanceAmount += vehicleFee;
        voyageOrder.voyage.operator.enterprise.systemOwner.account.balanceAmount += systemFeePerVoyageOrder;
        voyageOrder.voyage.operator.enterprise.entrepreneur.account.balanceAmount += (remainingCostPerVoyageOrder - driverFee - operatorFee - vehicleFee);
        console.log('\tVoyageOrderStatus:\t' + voyageOrder.voyageOrderStatus + '\tCredit:\t' + voyageOrder.customer.account.balanceCredit.toFixed(2));
        console.log('\tVehicleDriver:\t' + driver.screenName + '\tEarn:\t' + '+' + driver.account.balanceAmount.toFixed(2));
        console.log('\tTripOperator:\t' + voyageOrder.voyage.operator.screenName + '\tEarn:\t' + '+' + voyageOrder.voyage.operator.account.balanceAmount.toFixed(2));
        console.log('\tVechicleOwner:\t' + voyageOrder.voyage.vehicle.owner.screenName + '\tEarn:\t' + '+' + voyageOrder.voyage.vehicle.owner.account.balanceAmount.toFixed(2));
        console.log('\tEntrepreneur:\t' + voyageOrder.voyage.operator.enterprise.entrepreneur.screenName + '\tEarn:\t' + '+' + voyageOrder.voyage.operator.enterprise.entrepreneur.account.balanceAmount.toFixed(2));
        console.log('\tSystemOwner:\t' + voyageOrder.voyage.operator.enterprise.systemRate*100 + '%\t' + '\tFee:\t' + '+' + voyageOrder.voyage.operator.enterprise.systemOwner.account.balanceAmount.toFixed(2));
        let accountRegistry = await getAssetRegistry(voyageOrder.customer.account.getFullyQualifiedType());
        await accountRegistry.update(voyageOrder.voyage.operator.enterprise.entrepreneur.account);
        await accountRegistry.update(voyageOrder.voyage.operator.enterprise.systemOwner.account);
        await accountRegistry.update(voyageOrder.voyage.vehicle.owner.account);
        await accountRegistry.update(voyageOrder.voyage.operator.account);
        await accountRegistry.update(voyageOrder.customer.account);
        await accountRegistry.update(driver.account);
    }
    const assetRegistry = await getAssetRegistry('org.tripcontract.network.Vehicle');
    await assetRegistry.update(voyageOrder.voyage.vehicle);
    await voyageOrderRegistry.update(voyageOrder);
    // emit the update voyageOrder event
    let checkInOutVoyageOrderStatusEvent = factory.newEvent(namespace, 'CheckInCheckOutVoyageOrderEvent');
    checkInOutVoyageOrderStatusEvent.voyageOrderStatus = checkInOutVoyageOrderRequest.voyageOrderStatus;
    checkInOutVoyageOrderStatusEvent.voyageOrder = checkInOutVoyageOrderRequest.voyageOrder;
    checkInOutVoyageOrderStatusEvent.driver = checkInOutVoyageOrderRequest.driver;
    emit(checkInOutVoyageOrderStatusEvent);
}

// VOYAGE FUNCTIONS
/**
 * Operator offer a voyage for customers
 * @param {org.tripcontract.network.OfferVoyage} voyageRequest - the OfferVoyage transaction
 * @transaction
 */
async function offerVoyage(voyageRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';

    let voyage = factory.newResource(namespace, 'Voyage', voyageRequest.voyageId);

    voyage.operator = voyageRequest.operator;
    voyage.voyageName = voyageRequest.voyageName;
    voyage.voyageDesc = voyageRequest.voyageDesc;
    voyage.costPerPerson = voyageRequest.costPerPerson;
    voyage.stationStops = voyageRequest.stationStops;
    voyage.voyageStatus = 'CREATED';
    voyage.estimatedDistance = 0; /* reset to default, auto-calculated */
    voyage.estimatedMinutes = 0; /* reset to default, auto-calculated */
    // save the voyage into asset registry
    let assetRegistry = await getAssetRegistry(voyage.getFullyQualifiedType());
    await assetRegistry.add(voyage);
    // emit the offer voyage event when done
    let offerVoyageEvent = factory.newEvent(namespace, 'OfferVoyageEvent');
    offerVoyageEvent.voyageId = voyage.voyageId;
    offerVoyageEvent.voyageName = voyage.voyageName;
    offerVoyageEvent.voyageDesc = voyage.voyageDesc;
    offerVoyageEvent.costPerPerson = voyage.costPerPerson;
    offerVoyageEvent.stationStops = voyage.stationStops;
    offerVoyageEvent.voyageStatus = voyage.voyageStatus;
    offerVoyageEvent.operator = voyage.operator;
    emit(offerVoyageEvent);
}

/**
 * Update the status of an voyage
 * @param {org.tripcontract.network.UpdateVoyageStatus} updateVoyageRequest - the UpdateVoyageStatus transaction
 * @transaction
 */
async function updateVoyageStatus(updateVoyageRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    let updateVoyageStatusEvent = factory.newEvent(namespace, 'UpdateVoyageStatusEvent');

    // get voyage registry by namespace
    let voyageRegistry = await getAssetRegistry(namespace + '.Voyage');
    if (updateVoyageRequest.voyageStatus === 'DRV_ASSIGNED') {
        if (!updateVoyageRequest.driver) {
            throw new Error('Value for Driver was expected');
        }
        // assign the driver who take this voyageOrder to the voyage
        let voyage = await voyageRegistry.get(updateVoyageRequest.voyage.getIdentifier());
        voyage.voyageStatus = updateVoyageRequest.voyageStatus;
        voyage.driver = factory.newRelationship(namespace, 'Driver', updateVoyageRequest.driver.getIdentifier());
        await voyageRegistry.update(voyage);
        updateVoyageStatusEvent.voyageStatus = voyage.voyageStatus;
        updateVoyageStatusEvent.driver = voyage.driver;
        updateVoyageStatusEvent.voyage = voyage;
    } else if (updateVoyageRequest.voyageStatus === 'VIN_ASSIGNED') {
        if (!updateVoyageRequest.vehicle) {
            throw new Error('Value for Vehicle was expected');
        }
        // assign the vehicle from whom operate this voyageOrder to the voyage
        let voyage = await voyageRegistry.get(updateVoyageRequest.voyage.getIdentifier());
        voyage.voyageStatus = updateVoyageRequest.voyageStatus;
        voyage.vehicle = factory.newRelationship(namespace, 'Vehicle', updateVoyageRequest.vehicle.getIdentifier());
        await voyageRegistry.update(voyage);
        updateVoyageStatusEvent.voyageStatus = voyage.voyageStatus;
        updateVoyageStatusEvent.vehicle = voyage.vehicle;
        updateVoyageStatusEvent.voyage = voyage;
    } else {
        let voyage = updateVoyageRequest.voyage;
        voyage.voyageStatus = updateVoyageRequest.voyageStatus;
        await voyageRegistry.update(voyage);
        updateVoyageStatusEvent.voyageStatus = voyage.voyageStatus;
        updateVoyageStatusEvent.voyage = voyage;
    }
    emit(updateVoyageStatusEvent);
}

/**
 * Update the information of an voyage
 * @param {org.tripcontract.network.UpdateVoyage} updateVoyageRequest - the UpdateVoyage transaction
 * @transaction
 */
async function updateVoyage(updateVoyageRequest) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    let namespace = 'org.tripcontract.network';
    // get voyage registry by namespace
    let voyageRegistry = await getAssetRegistry(namespace + '.Voyage');
    let voyage = updateVoyageRequest.voyage;
    voyage.voyageName = updateVoyageRequest.voyageName;
    voyage.voyageDesc = updateVoyageRequest.voyageDesc;
    voyage.stationStops = updateVoyageRequest.stationStops;
    await voyageRegistry.update(voyage);
    let updateVoyageInfoEvent = factory.newEvent(namespace, 'UpdateVoyageEvent');
    updateVoyageInfoEvent.voyage = updateVoyageRequest.voyage;
    emit(updateVoyageInfoEvent);
}