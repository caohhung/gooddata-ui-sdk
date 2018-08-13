// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import HeatMapLegend, { IHeatMapLegendProps } from '../HeatMapLegend';

describe('HeatMapLegend', () => {
    const numericSymbols = [ 'k', 'M', 'G' ];
    function renderLegend(props: IHeatMapLegendProps) {
        return shallow(
            <HeatMapLegend {...props}/>
        );
    }

    it('should render legend', () => {
        const series = [
            {
                color: 'abc',
                legendIndex: 0,
                range: {
                    from: 1,
                    to: 2
                }
            }, {
                color: 'def',
                legendIndex: 1,
                range: {
                    from: 4,
                    to: 5
                }
            }
        ];
        const wrapper = renderLegend({ series, numericSymbols, isSmall: false });

        expect(wrapper.find('.heatmap-legend').length).toEqual(1);
    });
});
