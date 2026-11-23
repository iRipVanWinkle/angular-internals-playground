import { DestroyRef, inject, Injectable, NgZone } from '@angular/core';
import type { BlockLineDirective } from './block-line.directive';

/**
 * Lines are drawn from measured coordinates, so they go stale when the layout shifts without
 * a render, e.g. the global stylesheet is loaded asynchronously in production (critical CSS
 * inlining) and may apply only after the first render. Any shift inside the tree resizes some container.
 */
@Injectable({ providedIn: 'root' })
export class LineLayoutObserver {
  private readonly lines = new Set<BlockLineDirective>();
  private readonly observer: ResizeObserver;

  constructor() {
    // Outside the zone, so that redrawing lines never triggers change detection the playground visualizes
    this.observer = inject(NgZone).runOutsideAngular(
      () => new ResizeObserver(() => this.lines.forEach((line) => line.setLine())),
    );

    inject(DestroyRef).onDestroy(() => this.observer.disconnect());
  }

  observe(line: BlockLineDirective, element: HTMLElement): void {
    this.lines.add(line);
    this.observer.observe(element);
  }

  unobserve(line: BlockLineDirective, element: HTMLElement): void {
    this.lines.delete(line);
    this.observer.unobserve(element);
  }
}
