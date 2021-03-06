(function() {
    $( function() {
        $(document).ready(function() {

          var start = moment().subtract(29, 'days');
          var end = moment();
          var group1 = 'client';
          var group2 = 'project';
          var group3 = '';
          var filterProjectId = '';
          var filterClientId = '';
       
          var chartData = {};
          getData();
          function getData(){
              var baseUrl = OC.generateUrl('/apps/timetracker/ajax/report?name=&from='+start.unix()+'&to='+end.unix()+'&group1='+group1+'&group2='+group2+'&timegroup='+group3+'&filterProjectId='+filterProjectId+'&filterClientId='+filterClientId);
              var default_colors = ['#3366CC','#DC3912','#FF9900','#109618','#990099','#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E','#316395','#994499','#22AA99','#AAAA11','#6633CC','#E67300','#8B0707','#329262','#5574A6','#3B3EAC']
              $.ajax({
                      /*headers: {requesttoken: oc_requesttoken},*/
                      url: baseUrl,
                      method: 'GET',
                      dataType: 'json',
                      success: function (d) {
                        chartData = {
                              labels: [],
                              datasets: [{ data: [], backgroundColor: []}, { data: [], backgroundColor: []},],
                            
                          };
                          var clientMap = {};
                          var nclients = 0;
                          // extract clients in clientMap
                          var totalMinutes = 0;
                          for (var x = 0; x < d.items.length; x++){
                            cid = d.items[x].client;
                            if (cid == null){
                              cid = -1;
                            }
                            if (clientMap[cid] === undefined){
                                clientMap[cid] = {duration:d.items[x].totalDuration, order:nclients, client:(d.items[x].client == null)?'Not Set':d.items[x].client}
                                totalMinutes += d.items[x].totalDuration/60.0;
                                nclients++;
                            } else {
                              clientMap[cid].duration = clientMap[cid].duration + d.items[x].totalDuration;
                              totalMinutes += d.items[x].totalDuration/60.0;
                            }
                          }
                          var mx = 0;
                          var nindex = nclients;

                          var sortable = [];
                          for (var client in clientMap) {
                              sortable.push([client, clientMap[client].order]);
                          }

                          sortable.sort(function(a, b) {
                              return a[1] - b[1];
                          });
                            for (var i = 0; i < sortable.length; i++) {
                              t = sortable[i];
                              key = t[0];
                              
                            // first add clients
                            chartData.datasets[0].data[clientMap[key].order] = clientMap[key].duration / 60.0;
                            chartData.datasets[1].data[clientMap[key].order] = 0;
                            if (clientMap[key].client == -1){
                              chartData.labels[clientMap[key].order] = "Client Not Set";
                              
                            } else {
                              chartData.labels[clientMap[key].order] = clientMap[key].client;
                            }
                            chartData.datasets[0].backgroundColor[clientMap[key].order] = default_colors[clientMap[key].order];
                            chartData.datasets[1].backgroundColor[clientMap[key].order] = default_colors[clientMap[key].order];
                            // add projects for each client
                            
                            for (var x = 0; x < d.items.length; x++){
                              
                              if (d.items[x].client === key || (d.items[x].client == null && key == -1)){
                                chartData.datasets[0].data[nindex] = 0;
                                chartData.datasets[1].data[nindex] = d.items[x].totalDuration/60.0;
                               
                                chartData.datasets[1].backgroundColor[nindex] = default_colors[nindex];
                                chartData.datasets[0].backgroundColor[nindex] = default_colors[nindex];
                                if (d.items[x].project == null){
                                  chartData.labels[nindex] = "Project Not Set";
                                } else {
                                  chartData.labels[nindex] = d.items[x].project;
                                }
                                nindex++;
                              }
                            }
                          };

                          var ctx = document.getElementById("myChart").getContext("2d");
                          var myDoughnutChart = new Chart(ctx, {
                            type: 'doughnut',
                            data: chartData,
                            options: {
                              tooltips: {
                                callbacks: {
                                  title: function(tooltipItem, data) {
                                    return data['labels'][tooltipItem[0]['index']];
                                  },
                                  label: function(tooltipItem, data) {

                                    mm =  data['datasets'][tooltipItem.datasetIndex]['data'][tooltipItem['index']];
                                    h = Math.trunc(mm / 60);
                                    m = Math.trunc(mm % 60);
                                    return (h+" hours "+m+" minutes")
                                  },
                                  afterLabel: function(tooltipItem, data) {
                                    
                                    var dataset = data['datasets'][tooltipItem.datasetIndex];
                                    var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
                                    return '(' + percent + '%)';
                                  }
                                },

                              }
                            }
                        });
                        h = Math.trunc(totalMinutes / 60);
                        m = Math.trunc(totalMinutes % 60);
                        $('#summary').html('Total time: '+h+" hours "+m+" minutes");
                      }
                  });
          }
      });
      } );
}());