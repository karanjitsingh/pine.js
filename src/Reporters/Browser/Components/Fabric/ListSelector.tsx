import * as React from "react";
import { Button, ListGroup } from "react-bootstrap";

export enum Orientation {
    Horizontal,
    Vertical
}

export interface ListSelectorProps<T> {
    direction?: Orientation;
    list: T[];
    itemRender?: (item: T) => JSX.Element;
    onSelect?: (value: T, index: number) => void;
    buttonClass?: string;
    default?: number;
    sticky?: boolean;
}

interface ListSelectorState<T> {
    selectedItem: number;
    itemRender: (item: T) => JSX.Element | string;
}

export class ListSelector<T extends { toString:() => string }> extends React.Component<ListSelectorProps<T>, ListSelectorState<T>> {

    public constructor(props: ListSelectorProps<T>) {
        super(props);

        this.state = {
            selectedItem: this.props.default !== undefined ? this.props.default : -1,
            itemRender: this.props.itemRender || ((item: T) => item.toString())
        };
    }

    public render() {

        if (!this.props.list || this.props.list.length === 0) {
            return [];
        }

        return (
            <ListGroup className={this.props.direction === Orientation.Horizontal ? "list-group-horizontal" : ""}>
                {this.props.list.map((element, index) => {
                    let buttonClass = "list-group-item";
                    buttonClass += index === this.state.selectedItem ? " active" : "";
                    buttonClass += this.props.buttonClass ? (" " + this.props.buttonClass) : "";

                    return <Button onClick={() => this.onSelect(element, index)} className={buttonClass}>{this.state.itemRender(element)}</Button>;
                })}
            </ListGroup>
        );
    }

    private onSelect(element: T, index: number) {
        if (this.props.onSelect) {
            this.props.onSelect(element, index);
        }

        if (this.props.sticky) {
            this.setState({
                selectedItem: index
            });
        }
    }
}