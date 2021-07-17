<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat
        >
          <v-btn color="primary" dark class="mr-4" @click="dialog = true">Agregar</v-btn>  

          <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click="setToday"
          >
            Hoy
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu
            bottom
            right
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Dia</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Semana</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Mes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 Dias</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">

        <v-calendar
          :short-weekdays="false"
          locale="es"
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        
        <!-- :weekdays="[1,2,3,4,5,6,0]" -->

        <!-- Modal agregar evento -->
        <v-dialog v-model="dialog">
            <v-card>
                <v-container>
                    <v-form @submit.prevent="addEvent"> 
                        <v-text-field 
                        type="text" label="Agregar Nombre" v-model="name">
                        </v-text-field>
                        <v-text-field 
                        type="text" label="Agregar un Detalle" v-model="details">
                        </v-text-field>
                        <v-text-field 
                        type="date" label="Inicio del Evento" v-model="start">
                        </v-text-field>
                        <v-text-field 
                        type="date" label="Fin del Evento" v-model="end">
                        </v-text-field>
                        <v-text-field 
                        type="color" label="Color del Evento" v-model="color">
                        </v-text-field>
                        <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog = false">Agregar</v-btn>
                    </v-form>
                </v-container>
            </v-card>
        </v-dialog>

        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn icon @click="deleteEvent(selectedEvent)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>


            <v-card-text>
              <v-form v-if="currentlyEditing !== selectedEvent.id">
                  {{selectedEvent.name}} - {{selectedEvent.details}}
              </v-form>

              <v-form v-else>
                  <v-text-field type="text" v-model="selectedEvent.name" label="Editar Nombre">
                  </v-text-field>
                  <textarea-autosize v-model="selectedEvent.details" type="text" style="width: 100%" :min-height="100"></textarea-autosize>
              </v-form>
            </v-card-text>


            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Cancel
              </v-btn>

              <v-btn text v-if="currentlyEditing !== selectedEvent.id"
              @click.prevent="editEvent(selectedEvent.id)">Editar</v-btn> 

              <v-btn text v-else @click.prevent="updateEvent(selectedEvent)">Guardar Cambios</v-btn>

            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>



<script>
  import {db} from '../main';  

  export default {
    data: () => ({
      today: new Date().toISOString().substr(0,10),  
      focus: new Date().toISOString().substr(0,10),
      type: 'month',
      typeToLabel: {
        month: 'Mes',
        week: 'Semana',
        day: 'Dia',
        '4day': '4 Dias',
      },
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      name: null,
      details: null,
      color: '#1976D2',
      dialog: false,
      currentlyEditing: null,
    //   colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    //   names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
    }),
    mounted () {
      this.$refs.calendar.checkChange();
    },
    created() {
      this.getEvents();  
    },
    methods: {
      async updateEvent(ev){
          try {
              await db.collection('eventos').doc(ev.id).update({
                  name: ev.name,
                  details: ev.details
              })

              this.selectedOpen = false;
              this.currentlyEditing = null;

          } catch (error) {
              console.log(error)
          }
      },  
      editEvent(id){
          this.currentlyEditing = id
      },  
      async deleteEvent(ev){
          try {
              await db.collection('eventos').doc(ev.id).delete();
             this.selectedOpen = false;
             this.getEvents();

          } catch (error) {
              console.log(error);
          }
      },
      async addEvent(){
          try {
              if(this.name && this.start && this.end){
                  await db.collection('eventos').add({
                      name: this.name,
                      details: this.details,
                      start: this.start,
                      end: this.end,
                      color: this.color
                  })

                  this.getEvents();

                  this.name = null;
                  this.details = null;
                  this.start = null;
                  this.end = null;
                  this.color = '#1976D2';

              }else{
                  console.log('Campos obligatorios');
              }
          } catch (error) {
              console.log(error)
          }
      },
      async getEvents(){
          try {
            const snapshot = await  db.collection('eventos').get();
            const events = [];

            snapshot.forEach(doc => {
                //console.log(doc.id);
                let eventoData = doc.data();
                eventoData.id = doc.id;
                events.push(eventoData);
            })

            this.events = events;
              
          } catch (error) {
            console.log(error)
          }
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = ''
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => {
            this.selectedOpen = true
          }, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange ({ start, end }) {
        const events = []

        const min = new Date(`${start.date}T00:00:00`)
        const max = new Date(`${end.date}T23:59:59`)
        const days = (max.getTime() - min.getTime()) / 86400000
        const eventCount = this.rnd(days, days + 20)

        for (let i = 0; i < eventCount; i++) {
          const allDay = this.rnd(0, 3) === 0
          const firstTimestamp = this.rnd(min.getTime(), max.getTime())
          const first = new Date(firstTimestamp - (firstTimestamp % 900000))
          const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
          const second = new Date(first.getTime() + secondTimestamp)

          events.push({
            name: this.names[this.rnd(0, this.names.length - 1)],
            start: first,
            end: second,
            color: this.colors[this.rnd(0, this.colors.length - 1)],
            timed: !allDay,
          })
        }

        this.events = events
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
    },
  }
</script>