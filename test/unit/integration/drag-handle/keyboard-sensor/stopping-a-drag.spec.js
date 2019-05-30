// @flow
import React from 'react';
import { render, createEvent, fireEvent } from 'react-testing-library';
import App from '../app';
import { getDropReason } from '../util';
import * as keyCodes from '../../../../../src/view/key-codes';
import { simpleLift, keyboard } from '../controls';
import supportedEventName from '../../../../../src/view/use-sensor-marshal/sensors/util/supported-page-visibility-event-name';

it('should prevent default on the event that causes a drop', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, { keyCode: keyCodes.space });
  fireEvent(handle, event);

  expect(event.defaultPrevented).toBe(true);
  expect(getDropReason(onDragEnd)).toBe('DROP');
});

it('should prevent default on an escape press', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  const event: Event = createEvent.keyDown(handle, {
    keyCode: keyCodes.escape,
  });
  fireEvent(handle, event);

  expect(event.defaultPrevented).toBe(true);
  expect(getDropReason(onDragEnd)).toBe('CANCEL');
});

it('should not prevent the default behaviour for an indirect cancel', () => {
  [
    'mousedown',
    'mouseup',
    'click',
    'touchstart',
    'resize',
    'wheel',
    supportedEventName,
  ].forEach((eventName: string) => {
    const onDragEnd = jest.fn();
    const { getByText, unmount } = render(<App onDragEnd={onDragEnd} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(keyboard, handle);

    const event: Event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
      target: handle,
    });

    fireEvent(handle, event);

    // not an explicit cancel
    expect(event.defaultPrevented).toBe(false);
    expect(getDropReason(onDragEnd)).toBe('CANCEL');

    unmount();
  });
});

it('should not prevent clicks after a drag', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);
  keyboard.drop(handle);

  const event: Event = createEvent.click(handle);
  fireEvent(handle, event);

  // click not blocked
  expect(event.defaultPrevented).toBe(false);
  expect(onDragEnd).toHaveBeenCalled();
});