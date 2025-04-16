/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, type OnInit } from '@angular/core'
import { OrderHistoryService } from '../Services/order-history.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { BasketService } from '../Services/basket.service'
import { ProductDetailsComponent } from '../product-details/product-details.component'
import { MatDialog } from '@angular/material/dialog'
import { type Product } from '../Models/product.model'
import { ProductService } from '../Services/product.service'
import { Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconButton } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { FlexModule } from '@angular/flex-layout/flex'
import { NgIf, NgFor } from '@angular/common'
import { MatCardModule, MatCardTitle, MatCardContent } from '@angular/material/card'

export interface StrippedProduct {
  id: number
  name: string
  price: number
  quantity: number
  total: number
}

export interface Order {
  orderId: string
  totalPrice: number
  bonus: number
  products: MatTableDataSource<StrippedProduct>
  delivered: boolean
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatCardTitle, NgIf, FlexModule, NgFor, TranslateModule, MatIconButton, MatTooltip, MatIconModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatCardContent]
})
export class OrderHistoryComponent implements OnInit {
  public tableColumns = ['product', 'price', 'quantity', 'total price', 'review']
  public orders: Order[] = []
  public emptyState: boolean = true

  constructor (private readonly router: Router, private readonly dialog: MatDialog, private readonly orderHistoryService: OrderHistoryService, private readonly basketService: BasketService, private readonly productService: ProductService, private readonly ngZone: NgZone) { }

  ngOnInit (): void {
    this.orderHistoryService.get().subscribe((orders) => {
      orders = orders.reverse()
      if (orders.length === 0) {
        this.emptyState = true
      } else {
        this.emptyState = false
      }
      for (const order of orders) {
        const products: StrippedProduct[] = []
        for (const product of order.products) {
          products.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            total: product.total
          })
        }
        this.orders.push({
          orderId: order.orderId,
          totalPrice: order.totalPrice,
          bonus: order.bonus,
          products: new MatTableDataSource<StrippedProduct>(products),
          delivered: order.delivered
        })
      }
    }, (err) => { console.log(err) })
  }

  showDetail (id: number) {
    this.productService.get(id).subscribe((product) => {
      const element: Product = {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        points: Math.round(product.price / 10)
      }
      this.dialog.open(ProductDetailsComponent, {
        width: '500px',
        height: 'max-content',
        data: {
          productData: element
        }
      })
    }, (err) => { console.log(err) })
  }

  openConfirmationPDF (orderId: string) {
    const redirectUrl = `${this.basketService.hostServer}/ftp/order_${orderId}.pdf`
    window.open(redirectUrl, '_blank')
  }

  trackOrder (orderId) {
    this.ngZone.run(async () => await this.router.navigate(['/track-result'], {
      queryParams: {
        id: orderId
      }
    }))
  }
}
