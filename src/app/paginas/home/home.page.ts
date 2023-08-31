import { Component } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { UserService } from '../../servicios/usuario/user.service';
import { ToastController } from '@ionic/angular';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import {
  DeviceMotion,
  DeviceMotionAccelerationData,
} from '@awesome-cordova-plugins/device-motion/ngx';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  pressedButton: boolean = false;
  alarmActivated: boolean = false;

  passwordVisible = false;
  passwordUser: string = '';
  password: string = '';

  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;
  subscription: any;

  audioLeft = '/assets/sonidos/audioIzquierda.mp3';
  audioRight = '/assets/sonidos/audioDerecha.mp3';
  audioVertical = '/assets/sonidos/audioVertical.mp3';
  audioHorizontal = '/assets/sonidos/audioHorizontal.mp3';
  audioPass = '/assets/sonidos/audioPass.mp3';
  audio = new Audio();

  firstAdmission: boolean = true;
  firstAdmissionFlash: boolean = true;

  currentPositionCellPhone = 'actual';
  previousPositionCellPhone = 'anterior';

  currentUser: any;

  constructor(
    private flashlight: Flashlight,
    private vibration: Vibration,
    private deviceMotion: DeviceMotion,
    public toast: ToastController,
    public navCtrl: NavController,
    private userService: UserService
  ) {
    this.currentUser = this.userService.getEmailUser();
    switch (this.currentUser) {
      case 'admin@admin.com':
        this.passwordUser = '111111';
        break;
      case 'invitado@invitado.com':
        this.passwordUser = '222222';
        break;
      case 'usuario@usuario.com':
        this.passwordUser = '333333';
        break;
      case 'anonimo@anonimo.com':
        this.passwordUser = '444444';
        break;
      case 'tester@tester.com':
        this.passwordUser = '555555';
        break;
    }
  }

  ngOnInit() {
    StatusBar.hide();
  }

  logoutUser() {
    this.userService.logout();

  }

  showPasswordInput() {
    this.passwordVisible = true;
  }

  activateAlarm() {
    this.pressedButton = true;
    setTimeout(() => {
      this.alarmActivated = true;
      this.AlertSuccess('Alarma activada').then((alert: any) => {
        alert.present();
        this.start();
      });
      this.pressedButton = false;
    }, 2000);
  }

  desactivateAlarm() {
    if (this.password == this.passwordUser) {
      this.pressedButton = true;
      setTimeout(() => {
        this.alarmActivated = false;
        this.AlertSuccess('Alarma desactivada').then((alert: any) => {
          this.subscription.unsubscribe();
          alert.present();
          this.firstAdmission = true;
          this.audio.pause();
        });
        this.passwordVisible = false;
        this.pressedButton = false;
        this.password = '';
      }, 2000);
    } else {
      this.Alert('Contraseña incorrecta').then((alert: any) => {
        alert.present();
        this.wrongPass();
      });
    }
  }

  start() {
    this.subscription = this.deviceMotion
      .watchAcceleration({ frequency: 300 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelerationX = Math.floor(acceleration.x);
        this.accelerationY = Math.floor(acceleration.y);
        this.accelerationZ = Math.floor(acceleration.z);

        if (acceleration.x > 5) {
          //Inclinacion Izquierda

          this.currentPositionCellPhone = 'izquierda';
          this.moveLeft();
        } else if (acceleration.x < -5) {
          //Inclinacion Derecha

          this.currentPositionCellPhone = 'derecha';
          this.moveRight();
        } else if (acceleration.y >= 9) {
          //encender flash por 5 segundos y sonido
          this.currentPositionCellPhone = 'arriba';

          if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
            this.audio.src = this.audioVertical;
            this.previousPositionCellPhone = 'arriba';
          }
          this.audio.play();
          this.moveVertical();
        } else if (
          acceleration.z >= 9 &&
          acceleration.y >= -1 &&
          acceleration.y <= 1 &&
          acceleration.x >= -1 &&
          acceleration.x <= 1
        ) {
          //acostado vibrar por 5 segundos y sonido
          this.currentPositionCellPhone = 'plano';
          this.moveHorizontal();
        }
      });
  }

  wrongPass() {
    this.firstAdmission = false;
    this.audio.src = this.audioPass;
    this.audio.play();
    this.firstAdmission ? null : this.vibration.vibrate(5000);
    this.firstAdmission = true;


    if (this.firstAdmissionFlash) {
      this.firstAdmissionFlash ? this.flashlight.switchOn() : false;
      setTimeout(() => {
        this.firstAdmissionFlash = true;
        this.flashlight.switchOff();
      }, 5000);
    }
  }

  moveLeft() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'izquierda';
      this.audio.src = this.audioLeft;
    }
    this.audio.play();
  }

  moveRight() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'derecha';
      this.audio.src = this.audioRight;
    }
    this.audio.play();
  }

  moveVertical() {
    if (this.firstAdmissionFlash) {
      this.firstAdmissionFlash ? this.flashlight.switchOn() : false;
      setTimeout(() => {
        this.firstAdmissionFlash = false;
        this.flashlight.switchOff();
      }, 5000);
      this.firstAdmission = false;
    }
  }

  moveHorizontal() {
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'plano';
      this.audio.src = this.audioHorizontal;
    }

    this.firstAdmission ? null : this.audio.play();
    this.firstAdmission ? null : this.vibration.vibrate(5000);
    this.firstAdmission = true;
    this.firstAdmissionFlash = true;
  }

  Alert(message: string) {
    return this.toast.create({
      message: message,
      position: 'top',
      color: 'danger',
      duration: 2000,
    });
  }

  AlertSuccess(message: string) {
    return this.toast.create({
      message: message,
      position: 'top',
      color: 'success',
      duration: 2000,
    });
  }

}