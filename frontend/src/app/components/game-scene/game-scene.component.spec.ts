import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSceneComponent } from './game-scene.component';

describe('GameSceneComponent', () => {
  let component: GameSceneComponent;
  let fixture: ComponentFixture<GameSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSceneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
