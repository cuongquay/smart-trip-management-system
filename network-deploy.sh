cd trip-contract-network && npm install
composer network deploy -a dist/trip-contract-network.bna -A admin -S adminpw -c PeerAdmin@hlfv1 -f ../packages/networkadmin.card
