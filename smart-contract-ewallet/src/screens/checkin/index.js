import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import QRCode from 'react-native-qrcode-svg';
import { I18n } from 'common';
import FlipCard from 'react-native-flip-card';
import CardView from 'react-native-cardview';
import { SlideButton, SlideDirection } from 'slide-button';
import md5 from 'md5';
import { Text, Colors, CountdownText, GradientLayout } from 'common/ui';
import generateOTP from 'otpjs';

export class CheckIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: '000000',
      phone_number: '0915651001',
      passcode: '123456',
      customer_id: 'yr90NG2rAWxdoBR6',
      device_id: 'e6dd1909e52e47099f8ef67c11e78679'
    };
  }

  componentWillMount() {
    this.state.otp = generateOTP({
      secret: md5(
        this.state.customer_id +
          ':' +
          this.state.device_id +
          ':' +
          this.state.passcode
      )
    });
  }

  render() {
    const { otp, phone_number, passcode, customer_id, device_id } = this.state;
    const { onPress } = this.props;
    return (
      <GradientLayout style={styles.container}>
        <Text
          style={{
            color: Colors.WHITE,
            marginBottom: 10,
            fontSize: 16
          }}
        >
          {I18n.t('home.qr_purchase.title')}
        </Text>
        <FlipCard
          friction={6}
          perspective={1000}
          style={styles.flipCardContainer}
          flipHorizontal
          flipVertical={false}
          flip={false}
          useNativeDriver
          clickable
        >
          {/* Face Side */}
          <View style={styles.qrWrapper}>
            <QRCode
              size={verticalScale(250)}
              value={
                'https://api.tripcontract.io/checkin?code=' +
                otp +
                '&phone=' +
                phone_number
              }
            />
          </View>
          {/* Back Side */}
          <View style={styles.cardWrapper}>
            <CardView cardElevation={2} cardMaxElevation={2} cornerRadius={5}>
              <View style={styles.cardDigits}>
                <Text semiBold style={styles.codeText}>
                  {otp}
                </Text>
              </View>
            </CardView>
          </View>
        </FlipCard>

        <CountdownText
          style={styles.countdown}
          autoLoop
          onReachedZero={() => {
            this.setState({
              otp: generateOTP({
                secret: md5(customer_id + ':' + device_id + ':' + passcode)
              })
            });
          }}
        />

        <TouchableOpacity style={styles.checkInView} onPress={onPress}>
          <SlideButton
            onSlideSuccess={onPress}
            slideDirection={SlideDirection.RIGHT}
            width={500}
            height={250}
          >
            <ImageBackground
              style={{ width: 60, height: 60 }}
              source={require('checkin/assets/qr-code-icon.png')}
            >
              <View style={{ height: 250, width: 335 }}>
                <Text style={styles.text}>
                  {I18n.t('home.qr_scan.touch_qr')}
                </Text>
              </View>
            </ImageBackground>
          </SlideButton>
        </TouchableOpacity>
      </GradientLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(10),
    flex: 1,
    alignItems: 'center'
  },
  countdown: {
    color: Colors.WHITE,
    fontSize: 15,
    marginTop: verticalScale(2)
  },
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(300),
    width: '100%'
  },
  cardDigits: {
    alignSelf: 'center',
    paddingHorizontal: scale(26),
    marginBottom: verticalScale(45),
    paddingVertical: verticalScale(8),
    backgroundColor: Colors.WHITE,
    borderRadius: 4
  },
  codeText: {
    fontSize: scale(45),
    letterSpacing: 3.6
  },
  qrWrapper: {
    padding: verticalScale(25),
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.WHITE,
    marginTop: verticalScale(4)
  },
  flipCardContainer: {
    borderWidth: 0,
    maxHeight: verticalScale(320),
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkInView: {
    borderRadius: 100,
    height: 60,
    width: '90%',
    marginTop: 40,
    marginBottom: 10,
    backgroundColor: Colors.WHITE
  },
  text: {
    color: 'rgb(193,199,208)',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    fontWeight: 'bold'
  }
});
