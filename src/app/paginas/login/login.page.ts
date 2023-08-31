import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserService } from '../../servicios/usuario/user.service';
import { StatusBar } from '@capacitor/status-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

})
export class LoginPage implements OnInit {
  correo: FormControl = new FormControl('', [Validators.required, Validators.email]);

  password: FormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  showSpinner:boolean = false;
  opcionSeleccionada: any;

  constructor(
    private userService: UserService) { }

  ngOnInit() {
    StatusBar.hide();
  }

  Login() {
    const correoL = this.correo.value?.toString()
    const passL = this.password.value?.toString()
    this.showSpinner=true;
    setTimeout(() => {
      this.userService.login(correoL,passL);
    }, 2000);
  }

  CargaUsuarios() {
    let correo = "";
    let password = "";

    switch (this.opcionSeleccionada) {
      case "admin":
        correo = "admin@admin.com";
        password = "111111";
        break;
      case "invitado":
        correo = "invitado@invitado.com";
        password = "222222";
        break;
      case "usuario":
        correo = "usuario@usuario.com";
        password = "333333";
        break;
      default:
        correo = "";
        password = "";
    }

    this.correo.setValue(correo);
    this.password.setValue(password);
  }

  ionViewWillLeave() {
    this.correo.reset();
    this.password.reset();
  }
}


