// tslint:disable
import * as React from 'react'
import { Split } from './split'

class SplitWrapper extends React.Component<SplitWrapperProps> {
    private parent: any;
    private split: any;

    componentDidMount() {
        const { children, gutter, ...options } = this.props

        // @ts-ignore
        options.gutter = (index, direction) => {
            let gutterElement

            if (gutter) {
                gutterElement = gutter(index, direction)
            } else {
                gutterElement = document.createElement('div')
                gutterElement.className = `gutter gutter-${direction}`
            }

            // eslint-disable-next-line no-underscore-dangle
            gutterElement.__isSplitGutter = true
            return gutterElement
        }

        this.split = Split(this.parent.children, options)
    }

    componentDidUpdate(prevProps) {
        const { children, minSize, sizes, collapsed, ...options } = this.props
        const {
            minSize: prevMinSize,
            sizes: prevSizes,
            collapsed: prevCollapsed,
        } = prevProps

        const otherProps = [
            'expandToMin',
            'gutterSize',
            'gutterAlign',
            'snapOffset',
            'dragInterval',
            'direction',
            'cursor',
        ]

        let needsRecreate = otherProps
            // eslint-disable-next-line react/destructuring-assignment
            .map(prop => this.props[prop] !== prevProps[prop])
            .reduce((accum, same) => accum || same, false)

        // Compare minSize when both are arrays, when one is an array and when neither is an array
        if (Array.isArray(minSize) && Array.isArray(prevMinSize)) {
            let minSizeChanged = false

            minSize.forEach((minSizeI, i) => {
                minSizeChanged = minSizeChanged || minSizeI !== prevMinSize[i]
            })

            needsRecreate = needsRecreate || minSizeChanged
        } else if (Array.isArray(minSize) || Array.isArray(prevMinSize)) {
            needsRecreate = true
        } else {
            needsRecreate = needsRecreate || minSize !== prevMinSize
        }

        // Destroy and re-create split if options changed
        if (needsRecreate) {
            // @ts-ignore
            options.minSize = minSize
            // @ts-ignore
            options.sizes = sizes || this.split.getSizes()
            this.split.destroy(true, true)
            options.gutter = (index, direction, pairB) => pairB.previousSibling
            this.split = Split(
                Array.from(this.parent.children).filter(
                    // eslint-disable-next-line no-underscore-dangle
                    // @ts-ignore
                    element => !element.__isSplitGutter,
                ),
                options,
            )
        } else if (sizes) {
            // If only the size has changed, set the size. No need to do this if re-created.
            let sizeChanged = false

            sizes.forEach((sizeI, i) => {
                sizeChanged = sizeChanged || sizeI !== prevSizes[i]
            })

            if (sizeChanged) {
                // eslint-disable-next-line react/destructuring-assignment
                this.split.setSizes(this.props.sizes)
            }
        }

        // Collapse after re-created or when collapsed changed.
        if (
            Number.isInteger(collapsed) &&
            (collapsed !== prevCollapsed || needsRecreate)
        ) {
            this.split.collapse(collapsed)
        }
    }

    componentWillUnmount() {
        this.split.destroy()
        delete this.split
    }

    render() {
        const {
            sizes,
            minSize,
            expandToMin,
            gutterSize,
            gutterAlign,
            snapOffset,
            dragInterval,
            direction,
            cursor,
            gutter,
            elementStyle,
            gutterStyle,
            onDrag,
            onDragStart,
            onDragEnd,
            collapsed,
            children,
            ...rest
        } = this.props

        return (
            <div className = { direction == "horizontal" ? "split-horizontal" : ""}
                ref={parent => {
                    this.parent = parent
                }}
                {...rest}
            >
                {children}
            </div>
        )
    }
}

interface SplitWrapperProps {
    sizes?: Array<number>,
    minSize?: number| Array<number>,
    expandToMin?: boolean,
    gutterSize?: number,
    gutterAlign?: string,
    snapOffset?: number,
    dragInterval?: number,
    direction?: string,
    cursor?: string,
    gutter?: (...args: any[]) => any,
    elementStyle?: (...args: any[]) => any,
    gutterStyle?: (...args: any[]) => any,
    onDrag?: (...args: any[]) => any,
    onDragStart?: (...args: any[]) => any,
    onDragEnd?: (...args: any[]) => any,
    collapsed?: number,
    children?: Array<any>,
}

export default SplitWrapper