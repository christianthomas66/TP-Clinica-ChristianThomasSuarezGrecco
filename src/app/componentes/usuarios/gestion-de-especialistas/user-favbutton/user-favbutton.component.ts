import { Component, Input, OnInit } from '@angular/core';
import { getDocs, Firestore, collection } from '@angular/fire/firestore';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-favbutton',
  standalone: true,
  imports: [],
  templateUrl: './user-favbutton.component.html',
  styleUrl: './user-favbutton.component.css'
})
export class UserFavbuttonComponent {
  @Input() data: any[] = [];

  @Input() idUsuario!: string;
  @Input() nombreUsuario!: string;
  @Input() fotoUsuario!: string;

  getUserById(id: string) {
    return this.data.find(x => x.id === id);
  }

  onDownloadExcel() {
    console.log(this.idUsuario);
    const data = this.getUserById(this.idUsuario);

    this.createExcel(data);
  }
  
  createExcel(data: any) {
    const dataArray = Array.isArray(data) ? data : [data];

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    saveAs(
      new Blob([excelBuffer]),
      `${data.id}.xlsx`
    );
  }
}
