import { Component, Input } from '@angular/core'
import { NgIf, DecimalPipe } from '@angular/common'

@Component({
  selector: 'score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss'],
  standalone: true,
  imports: [NgIf, DecimalPipe]
})
export class ScoreCardComponent {
  @Input()
  public description: string

  @Input()
  public total: number

  @Input()
  public score: number

  @Input()
  public showAsPercentage: boolean = true

  @Input()
  public showProgressBar: boolean = true
}
