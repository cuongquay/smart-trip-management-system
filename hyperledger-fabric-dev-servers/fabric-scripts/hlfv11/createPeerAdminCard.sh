#!/bin/bash

Usage() {
	echo ""
	echo "Usage: ./createPeerAdminCard.sh [-h host] [-n]"
	echo ""
	echo "Options:"
	echo -e "\t-h or --host:\t\t(Optional) name of the host to specify in the connection profile"
	echo -e "\t-n or --noimport:\t(Optional) don't import into card store"
	echo ""
	echo "Example: ./createPeerAdminCard.sh"
	echo ""
	exit 1
}

Parse_Arguments() {
	while [ $# -gt 0 ]; do
		case $1 in
			--help)
				HELPINFO=true
				;;
			--peer | -h)
                shift
				PEER0_ORG1_HOST="$1"
				;;
            --ca | -h)
                shift
				CA_ORG1_HOST="$1"
				;;
            --orderer | -h)
                shift
				ORDERER_HOST="$1"
				;;
            --noimport | -n)
				NOIMPORT=true
				;;
		esac
		shift
	done
}

PEER0_ORG1_HOST=localhost
CA_ORG1_HOST=localhost
ORDERER_HOST=localhost
Parse_Arguments $@

if [ "${HELPINFO}" == "true" ]; then
    Usage
fi

# Grab the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -z "${HL_COMPOSER_CLI}" ]; then
  HL_COMPOSER_CLI=$(which composer)
fi

echo
# check that the composer command exists at a version >v0.16
COMPOSER_VERSION=$("${HL_COMPOSER_CLI}" --version 2>/dev/null)
COMPOSER_RC=$?

if [ $COMPOSER_RC -eq 0 ]; then
    AWKRET=$(echo $COMPOSER_VERSION | awk -F. '{if ($2<19) print "1"; else print "0";}')
    if [ $AWKRET -eq 1 ]; then
        echo Cannot use $COMPOSER_VERSION version of composer with this level of fabric
        exit 1
    else
        echo Using composer-cli at $COMPOSER_VERSION
    fi
else
    echo 'Need to have composer-cli installed at v0.19 or greater'
    exit 1
fi

cat << EOF > connection.json
{
    "name": "tripcontract",
    "x-type": "hlfv1",
    "x-commitTimeout": 300,
    "version": "1.0.0",
    "client": {
        "organization": "TripContract",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300",
                    "eventHub": "300",
                    "eventReg": "300"
                },
                "orderer": "300"
            }
        }
    },
    "channels": {
        "tripcontractchannel": {
            "orderers": [
                "orderer.tripcontract.com"
            ],
            "peers": {
                "peer0.trade.tripcontract.com": {}
            }
        }
    },
    "organizations": {
        "TripContract": {
            "mspid": "TripContractMSP",
            "peers": [
                "peer0.trade.tripcontract.com"
            ],
            "certificateAuthorities": [
                "ca.trade.tripcontract.com"
            ]
        }
    },
    "orderers": {
        "orderer.tripcontract.com": {
            "url": "grpc://${ORDERER_HOST}:7050"
        }
    },
    "peers": {
        "peer0.trade.tripcontract.com": {
            "url": "grpc://${PEER0_ORG1_HOST}:7051",
            "eventUrl": "grpc://${PEER0_ORG1_HOST}:7053"
        }
    },
    "certificateAuthorities": {
        "ca.trade.tripcontract.com": {
            "url": "http://${CA_ORG1_HOST}:7054",
            "caName": "ca.trade.tripcontract.com"
        }
    }
}
EOF
CURRENT_DIR=$PWD
cd "${DIR}"/composer/crypto-config/peerOrganizations/trade.tripcontract.com/users/Admin@trade.tripcontract.com/msp/keystore/
PEER_ADMIN_PRIVATE_KEY=$(ls *_sk) && cd ${CURRENT_DIR}
PRIVATE_KEY="${DIR}"/composer/crypto-config/peerOrganizations/trade.tripcontract.com/users/Admin@trade.tripcontract.com/msp/keystore/${PEER_ADMIN_PRIVATE_KEY}
CERT="${DIR}"/composer/crypto-config/peerOrganizations/trade.tripcontract.com/users/Admin@trade.tripcontract.com/msp/signcerts/Admin@trade.tripcontract.com-cert.pem

if [ "${NOIMPORT}" != "true" ]; then
    CARDOUTPUT=/tmp/PeerAdmin@tripcontract.card
else
    CARDOUTPUT=PeerAdmin@tripcontract.card
fi

"${HL_COMPOSER_CLI}"  card create -p connection.json -u PeerAdmin -c "${CERT}" -k "${PRIVATE_KEY}" -r PeerAdmin -r ChannelAdmin --file $CARDOUTPUT

if [ "${NOIMPORT}" != "true" ]; then
    if "${HL_COMPOSER_CLI}"  card list -c PeerAdmin@tripcontract > /dev/null; then
        "${HL_COMPOSER_CLI}"  card delete -c PeerAdmin@tripcontract
    fi

    "${HL_COMPOSER_CLI}"  card import --file /tmp/PeerAdmin@tripcontract.card 
    "${HL_COMPOSER_CLI}"  card list
    echo "Hyperledger Composer PeerAdmin card has been imported, host of fabric specified as '${HOST}'"
    rm /tmp/PeerAdmin@tripcontract.card
else
    echo "Hyperledger Composer PeerAdmin card has been created, host of fabric specified as '${HOST}'"
fi
