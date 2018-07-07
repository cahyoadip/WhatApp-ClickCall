import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Linking,
  Image,
  Modal,
  StatusBar,
  Clipboard,
  ToastAndroid,
  PixelRatio,
  ActivityIndicator,
  AsyncStorage,
  CheckBox
} from 'react-native';

import CountryPicker from 'react-native-country-picker-modal';
import Data from '../quotes.json'
import {connect} from 'react-redux';
import * as quotesAction from './actions';
import Accordion from 'react-native-collapsible/Accordion';

const { width, height } = Dimensions.get('window')

class Main extends Component {
  constructor(props) {
    super(props)
    this.message = {
      title: 'This application allows you to send WhatsApp message without saving any contact number'
    }
    this.state = {
      cca2: 'ID',
      callingCode: '62',
      phoneNumber: '',
      text: '',
      modal: true,
      about: false,
      modalDial: false,
      height: 40,
      saveAs: false,
      alias: ''
    }
  }

  componentDidMount() {
    var _this = this;
    AsyncStorage.getItem('data', (err, data) => {
      if (data === null){
        AsyncStorage.setItem('data', JSON.stringify(Data.quotes));
        }
    });
    this.props.getQuotes()
  }

  createDate () {
    var d = new Date();
    var day = d.getDate()
    var month = d.getMonth()
    var year = d.getFullYear()
    var h = d.getHours()
    var m = d.getMinutes()
    var now = day+'/'+month+'/'+year+'\n'+h+':'+m
    return now
  }

  loadingView () {
    return (
      <View style={styles.insideContainer}>
        <ActivityIndicator color='#128C7E' size='large' animating={true}/>
      </View>
    )
  }

  helpler (title) {
    return (
      <View style={styles.headerInstruction}>
        <Text style={styles.instructions}>
          {title}
        </Text>
      </View>
    )
  }

  buttonHepler (modal) {
    const { closeButton, questionButton } = styles
    return (
      <TouchableOpacity style={modal ? closeButton : questionButton} onPress={() => this.setState({modal: !modal})}>
        <Image
          source={modal ? require('../assets/ic_close.png') : require('../assets/ic_comment.png')}
          style={styles.closeIcon}
        />
      </TouchableOpacity>
    )
  }

  modalAboutApps () {
    return (
      <Modal
          animationType="fade"
          transparent
          style={styles.modal}
          visible={this.state.about}
          onRequestClose={() => this.setState({about: false})}>
          <TouchableOpacity activeOpacity={1} onPress={() => this.setState({about: false})} style={styles.bgModal}
            onPress={() => this.setState({about: false})}>
            <View style={styles.viewModal}>
              <Image
                source={require('../assets/WhatsApp.png')}
                style={styles.waLogo}
              />
              <Text style={styles.aboutTitle}>WhatsApp ClickChat</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: '500'}]}>By Isidorus Cahyo Adi Prasetyo</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal'}]}>Version 1.0.0</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', textAlign: 'center'}]}>Written using React Native Framework</Text>
              <View style={styles.viewFeature}>
                <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal'}]}>Features</Text>
                <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', textAlign: 'center', lineHeight: 25}]}>Click Message WhatsApp instanly, including send text message, save contact in local storage</Text>
              </View>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', fontWeight: '500'}]}>Contact Me</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', color: 'blue'}]} onPress={() => Linking.openURL('mailto:mastercahyoadi@gmail.com')}>Email</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', color: 'blue'}]} onPress={() => Linking.openURL('https://www.facebook.com/cahyoadip09')}>Facebook</Text>
              <Text style={[styles.aboutTitle, {fontSize: 14, fontWeight: 'normal', textAlign: 'center', lineHeight: 25}]}>Give me your feedback to help me improve this application</Text>
            </View>
          </TouchableOpacity>
        </Modal>
    )
  }

  dialButton (modalDial) {
    return (
        <TouchableOpacity style={styles.dialButton} onPress={() => this.setState({modalDial: !modalDial})}>
          <Image
            source={require('../assets/ic_dialpad.png')}
            style={styles.dialIcon}
          />
        </TouchableOpacity>
    )
  }

  async _getContent() {
    const {phoneNumber} = this.state
    var content = await Clipboard.getString();
    var maskedNumber = content.replace('+62', '0')
    this.setState({phoneNumber: maskedNumber})
  }

  sendMassage (cca2, callingCode, number, text, alias){
    if (number.length < 10) {
      ToastAndroid.show('Phone number in incorrect', ToastAndroid.SHORT);
    } else if (text.length < 0) {
      ToastAndroid.show('Fill your message', ToastAndroid.SHORT);
    } else {
      if (number[0] !== '0') {
        ToastAndroid.show('Phone number must start with 08', ToastAndroid.SHORT);
      } else {
        var maskedNumber = number.replace('0', callingCode);
        Linking.openURL('whatsapp://send?phone=' + maskedNumber + '&text=' + text)
        this.saveNumber(cca2, maskedNumber, alias !== '' ? alias : null)
      }
    }
  }

  sendMassageDirecly (number){
    Linking.openURL('whatsapp://send?phone=' + number)
  }

  saveNumber (cca2, number, alias) {
    let generateID = Math.random().toString(3).substring(2, 5)
    let getDate = this.createDate()
    let data = {"cca2": cca2, "id": generateID, "number": number, "alias": alias, "date": getDate};
    this.props.addQuote(data)
    this.setState({modalDial: false})
    this.props.getQuotes()
  }

  modalInputNumber () {
    const {modalDial, phoneNumber, cca2, callingCode, text, height, saveAs, alias} = this.state
    return (
      <Modal
          animationType="fade"
          transparent
          style={styles.modalDial}
          visible={modalDial}
          onRequestClose={() => this.setState({modalDial: !modalDial})}>
          <View style={styles.bgModalDial}>
            <View style={{flex: 1, marginTop: -60, justifyContent: 'center'}}>
              <Text style={styles.welcomeText}>
                Compose Message
              </Text>
              <View style={{marginHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 7}}>
                <CountryPicker
                  onChange={value => {this.setState({ cca2: value.cca2, callingCode: value.callingCode })}}
                  closeable={true}
                  autoFocusFilter={false}
                  cca2={cca2}
                  filterable
                  styles={darkTheme}
                  filterPlaceholderTextColor={'#075E54'}
                />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  maxLength={16}
                  onChangeText={(value) => this.setState({phoneNumber: value.replace(/-/g, '')})}
                  onSubmitEditing={() => {
                    if (saveAs) this.refs.alias.focus()
                    else this.refs.text.focus()}
                  }
                  keyboardType='numeric'
                  placeholder={'Phone Number'}
                  underlineColorAndroid={'rgba(0,0,0,0)'}
                />
                <CheckBox
                  disabled={phoneNumber.length < 10}
                  value={saveAs}
                  onValueChange={() => this.setState({saveAs: !saveAs, alias: ''})}/>
                <Text style={{textAlign: 'center', fontSize: 10}}>Save{'\n'}As
                </Text>
              </View>
              {saveAs ? <View style={{marginHorizontal: 25, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 7}}>
                <TextInput
                  ref={'alias'}
                  value={alias}
                  style={[styles.textInput, {marginLeft: 0}]}
                  underlineColorAndroid={'rgba(0,0,0,0)'}
                  onSubmitEditing={() => this.refs.text.focus()}
                  onChangeText={(text) => this.setState({alias: text})}
                  placeholder={'Alias'}
                />
                <View style={[styles.button, {backgroundColor: 'transparent'}]}>
                  <Image
                      source={require('../assets/ic_send.png')}
                      style={[styles.iconSend, {tintColor: 'transparent'}]}
                    />
                </View>
              </View> : null}
              <View style={{marginHorizontal: 25, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                <TextInput
                  ref={'text'}
                  multiline
                  value={text}
                  style={[styles.textInput2, {height: Math.max(40, height)}]}
                  underlineColorAndroid={'rgba(0,0,0,0)'}
                  onChangeText={(text) => this.setState({text: text})}
                  placeholder={'Fill your message'}
                  onContentSizeChange={(event) => {
                    this.setState({height: event.nativeEvent.contentSize.height})
                  }}
                />
                <TouchableOpacity style={styles.button} onPress={() => this.sendMassage(cca2, callingCode, phoneNumber, text, alias)}>
                  <Image
                      source={require('../assets/ic_send.png')}
                      style={styles.iconSend}
                    />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    )
  }

  actionButton () {
    return (
      <TouchableOpacity style={{paddingLeft: 5}}>
        <Image
          source={require('../assets/ic_information.png')}
          style={styles.infoIcon}
        />
      </TouchableOpacity>
    )
  }

  flatList (quotes) {
    return (
      <View>
        <Text style={[{fontWeight: 'bold', fontSize: 19, paddingVertical: 15, textAlign: 'center'}]}>ClickCall Log's</Text>
        <Accordion
          underlayColor='transparent'
          sections={quotes}
          touchableComponent={TouchableOpacity}
          renderHeader={this._renderHeader}
          renderContent={this._renderContent}
        />
      </View>
    )
  }

  _renderHeader = (content, index, isActive, sections) => {
    return (
      <View style={[styles.row, isActive ? {borderBottomWidth: 0} : {borderBottomWidth: 0.5}]}>
        <Text style={styles.quote}>{content.cca2}</Text>
        <View style={{padding: 5}}/>
        <Text style={styles.quote}>+{content.number}</Text>
        <Text style={[{fontWeight: '500', fontSize: 16, paddingLeft: 10}]}>{content.alias !== null ? (content.alias) : ''}</Text>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text style={[{fontWeight: 'normal', fontSize: 12, paddingLeft: 10, textAlign: 'center'}]}>{content.date}</Text>
        </View>
      </View>
    );
  }

  actionDelete (id) {
    return this.props.deleteQuote(id)
  }

  _renderContent = (content, index, isActive, sections) => {
    return (
      <View style={{paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 0.5, borderBottomColor: '#ccc', flexDirection: 'row', flex: 1, justifyContent: 'flex-start'}}>
        <TouchableOpacity onPress={() => this.sendMassageDirecly(content.number)} style={{flex: 1, alignItems: 'center'}}>
          <Image
            source={require('../assets/ic_whatsapp.png')}
            style={styles.acitionIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.deleteQuote(content.id)} style={{borderLeftColor: '#ccc', borderLeftWidth: 0.5, flex: 1, alignItems: 'center'}}>
          <Image
            source={require('../assets/ic_delete.png')}
            style={styles.acitionIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {about, modalDial} = this.state
    const { loading, quotes } = this.props
    return (
      <View style={styles.container}>
         <StatusBar
          backgroundColor="#128C7E"
          barStyle="light-content"
        />
        <View style={styles.header}>
          <Text style={styles.textHeader}>
            WhatsApp ClickChat
          </Text>
          {modalDial ? null : <TouchableOpacity style={styles.information} onPress={() => this.setState({about: !about})}>
            <Image
              source={require('../assets/ic_information.png')}
              style={styles.infoIcon}
            />
          </TouchableOpacity>}
        </View>
        { loading ? this.loadingView() : this.flatList(quotes) }
        { this.dialButton(modalDial) }
        { this.modalAboutApps() }
        { this.modalInputNumber() }
      </View>
    );
  }
}

function mapStateToProps(state, props) {
  console.log(state.dataReducer.quotes)
  return {
      loading: state.dataReducer.loading,
      quotes: state.dataReducer.quotes
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getQuotes: () => dispatch(quotesAction.getQuotes()),
    addQuote: (params) => dispatch(quotesAction.addQuote(params)),
    deleteQuote: (params) => dispatch(quotesAction.deleteQuote(params)),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  instructions: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
    marginBottom: 5
  },
  data: {
    padding: 15,
    marginTop: 10,
    backgroundColor: '#ddd',
    borderColor: '#888',
    borderWidth: 1 / PixelRatio.get(),
    color: '#777'
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 110,
    zIndex: 0
  },
  dialButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    zIndex: 0,
    height: 60,
    width: 60,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25D366'
  },
  dialIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF'
  },
  questionButton: {
    position: 'absolute',
    right: 15,
    top: 80,
    zIndex: 0
  },
  information: {
    justifyContent: 'center',
    right: 15,
  },
  infoIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF'
  },
  acitionIcon: {
    width: 34,
    height: 34,
    tintColor: '#25D366'
  },
  waLogo: {
    width: 150,
    height: 150,
  },
  closeIcon: {
    width: 24,
    height: 24,
    margin: 10,
  },
  iconSend: {
    width: 24,
    height: 24,
    margin: 10,
  },
  insideContainer: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECE5DD',
  },
  justifyContainer: {
    flex: 1,
    width: width,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#ECE5DD',
  },
  headerInstruction: {
    backgroundColor: '#DCF8C6',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  header: {
    backgroundColor: '#128C7E',
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width,
    flexDirection: 'row'
  },
  textHeader: {
    paddingHorizontal: 15,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#FFFFFF'
  },
  textInput: {
    marginLeft: 10,
    flex: 1,
    backgroundColor: '#fff', 
    width: width - 200,
    borderRadius: 10,
    height: 40
  },
  textInput2: {
    flex: 1,
    backgroundColor: '#fff', 
    width: width - 200,
    borderRadius: 10,
    maxHeight: 100
  },
  welcomeText: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    paddingBottom: 15,
    color: '#075E54'
  },
  textButton: {
    textAlign: 'center',
    color: '#FFFFFF'
  },
  instructions: {
    padding: 15,
    textAlign: 'center',
    color: '#075E54'
  },
  button: {
    marginLeft: 10,
    borderRadius: 200,
    backgroundColor: '#128C7E',
  },
  iconButton: {
    marginLeft: 10,
    borderRadius: 200,
    backgroundColor: '#128C7E',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalDial: {
    alignItems: 'center'
  },
  bgModal: {
    padding: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  bgModalDial: {
    marginTop: 60,
    flex: 1,
    backgroundColor: '#ECE5DD'
  },
  viewModal: {
    padding: 15,
    borderRadius: 20,
    flex: 1,
    width: width - 100,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black'
  },
  viewFeature: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    elevation: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  row:{
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: "#ccc",
    padding: 15
  },
  quote: {
    fontSize: 19,
  },
});

const darkTheme = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#ECE5DD'
   },
   contentContainer: {
    backgroundColor: '#ECE5DD'
   },
   header: {
    backgroundColor: '#128C7E',
    borderBottomWidth: 0,
    height: 60
   },
   itemCountryName: {
     fontSize: 16,
     color: '#075E54',
     paddingLeft: 10,
     borderBottomWidth: 0,
   },
   countryName: {
     fontSize: 16,
     color: '#075E54'
   },
   letters: {
    marginVertical: 10
   },
   letterText: {
     fontSize: 16,
     lineHeight: 20,
     color: '#075E54'
   },
   closeButtonImage: {
     height: 22,
     width: 22
   },
   closeButton: {
     height: 22,
     width: 22,
     marginLeft: 16,
     marginRight: 25
   },
   input: {
     height: 50,
     color: 'black',
     padding: 0,
     margin: 0,
     fontSize: 16,
     borderBottomWidth: 0
   }
 });
 

export default connect(mapStateToProps, mapDispatchToProps)(Main);

