var chai = require('chai');
var rewire = require('rewire');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

const voyagesService = rewire('../../services/voyagesService');

describe('voyages:', function () {
    before('Prepare for voyages test specs', function () {});

    it('Should be rejected with ErrorOperationNotImplemetedException when calling getVoyageById', function () {
        return voyagesService.getVoyageById('id').should.eventually.rejected;
    });


    it('Should be rejected with ErrorOperationNotImplemetedException when calling updateVoyageById', function () {
        return voyagesService.updateVoyageById('id', 'body').should.eventually.rejected;
    });


    it('Should be rejected with ErrorOperationNotImplemetedException when calling deleteVoyagesById', function () {
        return voyagesService.deleteVoyagesById('id').should.eventually.rejected;
    });


    it('Should be rejected with ErrorOperationNotImplemetedException when calling getVoyages', function () {
        return voyagesService.getVoyages('name').should.eventually.rejected;
    });


    it('Should be rejected with ErrorOperationNotImplemetedException when calling createVoyages', function () {
        return voyagesService.createVoyages('body').should.eventually.rejected;
    });

    after('Cleanup voyages test specs', function () {});
});
