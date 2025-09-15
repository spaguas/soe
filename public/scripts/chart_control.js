function renderDischargeChart(container, data){
    const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    const monthlyVolumes = monthOrder.map((monthKey) => {
        const monthData = data?.vazoes?.[monthKey] || {};
        const rawVolMax = monthData.vol_max;
        const volMaxNumber = Number(rawVolMax);
        const hasVolMax = rawVolMax !== null && rawVolMax !== undefined && rawVolMax !== '' && !Number.isNaN(volMaxNumber);

        if (volMaxNumber > 0) {
            return volMaxNumber;
        }

        if (data?.tem_sazonalidade === true && hasVolMax) {
            return 0;
        }

        const hours = Number(monthData.horas);
        const flow = Number(monthData.vazao_m3h);

        if (!Number.isFinite(hours) || !Number.isFinite(flow) || hours <= 0 || flow <= 0) {
            return 0;
        }

        return hours * flow;
    });

    const cumulativeVolumes = monthlyVolumes.reduce((acc, volume, index) => {
        const previousTotal = index > 0 ? acc[index - 1] : 0;
        if(volume > 0){
            acc.push(previousTotal + volume);
        }
        else{
            acc.push(volume);
        }

        return acc;
    }, []);

    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            crosshair: true,
            accessibility: {
                description: 'Meses do Ano'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Vazão (m³)'
            }
        },
        tooltip: {
            valueSuffix: ' (m³)'
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [
            {
                name: 'Volume Mensal',
                data: monthlyVolumes
            },
            {
                name: 'Volume Acumulado',
                data: cumulativeVolumes
            },
            
        ]
    });
}
